#!/usr/bin/env node
/**
 * Importe les chiffres publiables du classeur de cadrage dans data/donnees.json.
 *
 *   node scripts/import-donnees.mjs <chemin du classeur .xlsx>
 *
 * Seuls les onglets Site_Parametres, Site_Indicateurs et Site_Series sont lus
 * (valeurs calculées des formules). Feuil1, qui contient des prévisions
 * confidentielles, n'est jamais consultée. Les années postérieures à
 * `derniere_annee` ne sont jamais lues, même si des cellules sont remplies.
 *
 * Le script s'arrête sans rien écrire si une ligne de la colonne « Contrôle »
 * n'affiche pas OK, ou si une valeur attendue est manquante ou invalide.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";

const OUTPUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "donnees.json");
const STATUTS = new Set(["Réalisé", "Estimation"]);

class ImportError extends Error {}

function fail(message) {
  throw new ImportError(message);
}

/** Valeur affichée d'une cellule : résultat calculé pour une formule, null si vide. */
function cellValue(cell) {
  let value = cell.value;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if ("error" in value) fail(`${cell.worksheet.name}!${cell.address} : erreur Excel ${value.error}`);
    if ("formula" in value || "sharedFormula" in value) {
      value = value.result;
      if (value && typeof value === "object" && "error" in value) {
        fail(`${cell.worksheet.name}!${cell.address} : erreur Excel ${value.error}`);
      }
    } else if ("richText" in value) {
      value = value.richText.map((part) => part.text).join("");
    } else if ("text" in value) {
      value = value.text;
    }
  }
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
}

/** Clé d'une ligne de données (identifiant sans espace) ; null pour les lignes vides ou de note. */
function rowKey(row, col) {
  const cle = cellValue(row.getCell(col("cle")));
  return typeof cle === "string" && /^[A-Za-z0-9_-]+$/.test(cle) ? cle : null;
}

function normalizeHeader(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function getSheet(workbook, name) {
  const sheet = workbook.getWorksheet(name);
  if (!sheet) fail(`onglet « ${name} » introuvable`);
  return sheet;
}

/** Colonnes nommées (cle, libelle, …) et colonnes d'années (en-têtes numériques). */
function readHeaders(sheet, required) {
  const columns = {};
  const years = [];
  sheet.getRow(1).eachCell((cell, col) => {
    const raw = cellValue(cell);
    if (typeof raw === "number" && Number.isInteger(raw)) years.push({ year: raw, col });
    else if (raw !== null) columns[normalizeHeader(raw)] = col;
  });
  for (const name of required) {
    if (!columns[normalizeHeader(name)]) fail(`${sheet.name} : colonne « ${name} » introuvable`);
  }
  const col = (name) => columns[normalizeHeader(name)];
  return { col, years };
}

function asNumber(cell, label) {
  const value = cellValue(cell);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${cell.worksheet.name}!${cell.address} (${label}) : nombre attendu, trouvé ${JSON.stringify(value)}`);
  }
  return value;
}

function asText(cell, label) {
  const value = cellValue(cell);
  if (value === null) fail(`${cell.worksheet.name}!${cell.address} (${label}) : valeur manquante`);
  return String(value);
}

function toIsoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const match = String(value ?? "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) fail(`date_donnees : format JJ/MM/AAAA attendu, trouvé ${JSON.stringify(value)}`);
  const [, d, m, y] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function readParametres(workbook) {
  const sheet = getSheet(workbook, "Site_Parametres");
  const params = {};
  sheet.eachRow((row) => {
    const key = cellValue(row.getCell(1));
    if (typeof key === "string") params[key] = cellValue(row.getCell(2));
  });
  const derniere = params.derniere_annee;
  const premiere = params.premiere_annee;
  if (!Number.isInteger(derniere)) fail("Site_Parametres : derniere_annee doit être une année");
  if (!Number.isInteger(premiere) || premiere > derniere) fail("Site_Parametres : premiere_annee invalide");
  if (!params.source) fail("Site_Parametres : source manquante");
  return {
    source: String(params.source),
    date: toIsoDate(params.date_donnees),
    premiereAnnee: premiere,
    derniereAnnee: derniere,
  };
}

/** Lignes de données dont le contrôle n'affiche pas OK. */
function controlErrors(sheet, col) {
  const errors = [];
  sheet.eachRow((row, r) => {
    if (r === 1) return;
    const cle = rowKey(row, col);
    if (cle === null) return;
    const controle = cellValue(row.getCell(col("Contrôle")));
    if (controle !== "OK") errors.push(`${sheet.name} ligne ${r} (${cle}) : Contrôle = ${JSON.stringify(controle)}`);
  });
  return errors;
}

function readIndicateurs(workbook, params) {
  const sheet = getSheet(workbook, "Site_Indicateurs");
  const { col } = readHeaders(sheet, ["cle", "libelle", "valeur", "unite", "annee", "statut", "Contrôle"]);
  const errors = controlErrors(sheet, col);
  const indicateurs = [];
  sheet.eachRow((row, r) => {
    if (r === 1) return;
    const cle = rowKey(row, col);
    if (cle === null) return;
    const annee = asNumber(row.getCell(col("annee")), "annee");
    if (!Number.isInteger(annee) || annee < params.premiereAnnee || annee > params.derniereAnnee) {
      fail(`Site_Indicateurs ligne ${r} (${cle}) : année ${annee} hors de la période publiée`);
    }
    const statut = asText(row.getCell(col("statut")), "statut");
    if (!STATUTS.has(statut)) fail(`Site_Indicateurs ligne ${r} (${cle}) : statut inconnu « ${statut} »`);
    indicateurs.push({
      cle: String(cle),
      libelle: asText(row.getCell(col("libelle")), "libelle"),
      valeur: asNumber(row.getCell(col("valeur")), "valeur"),
      unite: asText(row.getCell(col("unite")), "unite"),
      annee,
      statut,
    });
  });
  return { indicateurs, errors };
}

function readSeries(workbook, params) {
  const sheet = getSheet(workbook, "Site_Series");
  const { col, years } = readHeaders(sheet, ["rubrique", "cle", "libelle", "unite", "Contrôle"]);
  const errors = controlErrors(sheet, col);

  // Années publiables uniquement : les colonnes au-delà de derniere_annee ne sont jamais lues.
  const candidateYears = years.filter(
    ({ year }) => year >= params.premiereAnnee && year <= params.derniereAnnee,
  );

  let statusRow = null;
  sheet.eachRow((row) => {
    if (cellValue(row.getCell(col("rubrique"))) === "_statut") statusRow = row;
  });
  if (!statusRow) fail("Site_Series : ligne « _statut » introuvable");

  const annees = [];
  for (const { year, col: c } of candidateYears) {
    const statut = cellValue(statusRow.getCell(c));
    if (statut === null) continue; // année non publiée
    if (!STATUTS.has(statut)) fail(`Site_Series : statut inconnu « ${statut} » pour ${year}`);
    annees.push({ annee: year, statut, col: c });
  }
  if (annees.length === 0) fail("Site_Series : aucune année publiée");

  const rubriques = [];
  sheet.eachRow((row, r) => {
    if (r === 1) return;
    const rubrique = cellValue(row.getCell(col("rubrique")));
    const cle = rowKey(row, col);
    if (rubrique === null || rubrique === "_statut" || cle === null) return;
    const valeurs = [];
    for (const { annee, statut, col: c } of annees) {
      const cell = row.getCell(c);
      if (cellValue(cell) === null) continue; // cellule vide = année non publiée
      valeurs.push({ annee, valeur: asNumber(cell, `${cle} ${annee}`), statut });
    }
    let group = rubriques.find((item) => item.cle === rubrique);
    if (!group) {
      group = { cle: String(rubrique), series: [] };
      rubriques.push(group);
    }
    group.series.push({
      cle: String(cle),
      libelle: asText(row.getCell(col("libelle")), "libelle"),
      unite: asText(row.getCell(col("unite")), "unite"),
      valeurs,
    });
  });

  return {
    annees: annees.map(({ annee, statut }) => ({ annee, statut })),
    rubriques,
    errors,
  };
}

/** Garde-fou final : aucune année au-delà de derniere_annee ne doit sortir du classeur. */
function assertNoFutureYears(data) {
  const max = data.derniereAnnee;
  const years = [
    ...data.annees.map((a) => a.annee),
    ...data.indicateurs.map((i) => i.annee),
    ...data.rubriques.flatMap((r) => r.series.flatMap((s) => s.valeurs.map((v) => v.annee))),
  ];
  const leaked = years.filter((year) => year > max);
  if (leaked.length > 0) fail(`années postérieures à ${max} détectées : ${[...new Set(leaked)].join(", ")}`);
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage : node scripts/import-donnees.mjs <chemin du classeur .xlsx>");
    process.exit(2);
  }
  if (!existsSync(file)) fail(`fichier introuvable : ${file}`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);

  const params = readParametres(workbook);
  const { indicateurs, errors: indicatorErrors } = readIndicateurs(workbook, params);
  const { annees, rubriques, errors: seriesErrors } = readSeries(workbook, params);

  const errors = [...indicatorErrors, ...seriesErrors];
  if (errors.length > 0) {
    fail(`contrôles en échec, import annulé :\n  - ${errors.join("\n  - ")}`);
  }

  const data = { ...params, annees, indicateurs, rubriques };
  assertNoFutureYears(data);

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  const seriesCount = rubriques.reduce((n, r) => n + r.series.length, 0);
  console.log(
    `data/donnees.json écrit : ${indicateurs.length} indicateurs, ${seriesCount} séries en ${rubriques.length} rubriques, ` +
      `années ${annees.map((a) => `${a.annee}${a.statut === "Estimation" ? " (estimation)" : ""}`).join(", ")}.`,
  );
}

main().catch((error) => {
  if (error instanceof ImportError) {
    console.error(`Import refusé : ${error.message}`);
    process.exit(1);
  }
  throw error;
});
