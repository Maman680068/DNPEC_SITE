/**
 * Crée des versions anglaises WordPress (slug …-en + catégorie `en`)
 * à partir des pages/articles FR déjà publiés.
 *
 * Usage (depuis la racine du projet) :
 *   node scripts/seed-wp-en.mjs
 *
 * Prérequis : WORDPRESS_API_URL, WORDPRESS_APP_USER, WORDPRESS_APP_PASSWORD dans .env.local
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const file = path.join(__dirname, "..", ".env.local");
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const TITLE_EN = {
  mission: "Mission",
  "mot-du-directeur-national": "Message from the National Director",
  "loi-des-finances": "Budget law",
  "code-des-investissements": "Investment code",
  "code-general-des-impots": "General tax code",
  "code-des-marches-publics": "Public procurement code",
  "code-minier": "Mining code",
  "tableau-de-bord-mensuel-de-leconomie-guineenne-tbmeg": "Monthly dashboard of the Guinean economy (TBMEG)",
  "autres-notes-techniques": "Other technical notes",
  "rapport-cpia-comite-devaluation-des-politiques-et-institutions-nationales": "CPIA report",
  "rapport-economique-et-financier-ref": "Economic and financial report (REF)",
  "rpae-presentation": "RPAE — About the journal",
  "rpae-equipe-editoriale": "RPAE — Editorial team",
  "rpae-instructions-auteurs": "RPAE — Notes for authors",
};

const POST_TITLE_EN = {
  "dnpec-comprendre-la-pnurie-de-billets-et-la-liquidit-fiduciaire":
    "DNPEC / Understanding the banknote shortage and cash liquidity",
  "dnpec-la-guine-se-dote-doutils-modernes-pour-mieux-piloter-son-conomie":
    "DNPEC / Guinea adopts modern tools to better steer its economy",
  "dnpec-notation-souveraine-la-guine-passe-de-b-stable-b-avec-perspectives-positives-note-attribue-par-sp":
    "DNPEC / Sovereign rating: Guinea moves to “B+ with positive outlook” (S&P)",
  "simandou-2024-le-prsident-du-comit-stratgique-djiba-diakit-prside-la-dernire-phase-de-validation-de-la-documentation-du-programme":
    "Simandou 2024: Strategic Committee Chair Djiba Diakité leads the final documentation validation phase",
  "clture-officielle-du-sminaire-rgional-afritac-ouest-fmi-sur-les-statistiques-macroconomiques-intervention-du-ministre-mourana-soumah":
    "Official closing of the AFRITAC West (IMF) regional seminar on macroeconomic statistics — address by Minister Mourana Soumah",
  "lancement-de-latelier-sur-lvaluation-du-systme-de-passation-des-marchs-publics-selon-la-mthodologie-maps-ii":
    "Launch of the workshop on assessing the public procurement system using the MAPS II methodology",
};

const INTRO_EN =
  "<p><em>English version.</em> The documents and detailed content below follow the French publication; full English editorial text will be completed by the DNPEC communications team.</p>";

async function main() {
  const env = loadEnvLocal();
  const base = env.WORDPRESS_API_URL?.replace(/\/$/, "");
  const user = env.WORDPRESS_APP_USER;
  const pass = env.WORDPRESS_APP_PASSWORD;
  if (!base || !user || !pass) {
    console.error("Missing WORDPRESS_API_URL / WORDPRESS_APP_USER / WORDPRESS_APP_PASSWORD in .env.local");
    process.exit(1);
  }

  const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  async function api(method, route, body) {
    const res = await fetch(`${base}${route}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      throw new Error(`${method} ${route} -> ${res.status} ${text.slice(0, 300)}`);
    }
    return json;
  }

  const me = await api("GET", "/users/me");
  console.log(`Authenticated as ${me.slug || me.name} (id ${me.id})`);

  let enCatId;
  const cats = await api("GET", "/categories?slug=en");
  if (cats?.[0]?.id) {
    enCatId = cats[0].id;
    console.log(`Category en already exists (#${enCatId})`);
  } else {
    const created = await api("POST", "/categories", {
      name: "English",
      slug: "en",
      description: "English-language news for the DNPEC website (/en)",
    });
    enCatId = created.id;
    console.log(`Created category en (#${enCatId})`);
  }

  async function ensurePageEn(frSlug) {
    const enSlug = `${frSlug}-en`;
    const existing = await api("GET", `/pages?slug=${encodeURIComponent(enSlug)}&_fields=id,slug`);
    if (existing?.length) {
      console.log(`  skip page ${enSlug} (exists)`);
      return;
    }
    const fr = await api("GET", `/pages?slug=${encodeURIComponent(frSlug)}&_embed`);
    if (!fr?.[0]) {
      console.log(`  skip page ${frSlug} (not found)`);
      return;
    }
    const source = fr[0];
    const title = TITLE_EN[frSlug] || `English — ${source.title?.rendered || frSlug}`;
    const content = `${INTRO_EN}\n${source.content?.rendered || ""}`;
    const created = await api("POST", "/pages", {
      title,
      slug: enSlug,
      status: "publish",
      content,
      featured_media: source.featured_media || undefined,
    });
    console.log(`  created page ${enSlug} (#${created.id})`);
  }

  async function ensurePostEn(frSlug) {
    const enSlug = `${frSlug}-en`;
    const existing = await api("GET", `/posts?slug=${encodeURIComponent(enSlug)}&_fields=id,slug`);
    if (existing?.length) {
      console.log(`  skip post ${enSlug} (exists)`);
      return;
    }
    const fr = await api("GET", `/posts?slug=${encodeURIComponent(frSlug)}&_embed`);
    if (!fr?.[0]) {
      console.log(`  skip post ${frSlug} (not found)`);
      return;
    }
    const source = fr[0];
    const title = POST_TITLE_EN[frSlug] || `English — ${source.title?.rendered || frSlug}`;
    const content = `${INTRO_EN}\n${source.content?.rendered || ""}`;
    const categories = Array.from(new Set([...(source.categories || []), enCatId]));
    const created = await api("POST", "/posts", {
      title,
      slug: enSlug,
      status: "publish",
      content,
      excerpt: source.excerpt?.rendered || "",
      featured_media: source.featured_media || undefined,
      categories,
    });
    console.log(`  created post ${enSlug} (#${created.id})`);
  }

  console.log("\nPages…");
  for (const slug of Object.keys(TITLE_EN)) {
    await ensurePageEn(slug);
  }

  console.log("\nPosts…");
  for (const slug of Object.keys(POST_TITLE_EN)) {
    await ensurePostEn(slug);
  }

  console.log("\nDone. Open /en and hard-refresh (Ctrl+F5).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
