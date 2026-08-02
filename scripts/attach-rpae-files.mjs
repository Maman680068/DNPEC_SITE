/**
 * Attache un .docx d'exemple à chaque article RPAE (publiés + pending).
 *
 * Usage :
 *   node --env-file=.env.local scripts/attach-rpae-files.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");
const USER = process.env.WORDPRESS_APP_USER;
const PASS = process.env.WORDPRESS_APP_PASSWORD?.replace(/\s+/g, "");

if (!API || !USER || !PASS) {
  console.error("Variables WORDPRESS_* manquantes dans .env.local");
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${USER}:${PASS}`).toString("base64")}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "rpae-exemples");

// --- CRC32 + ZIP store (suffisant pour un .docx minimal) ---

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n, 0);
  return b;
}
function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0, 0);
  return b;
}

/** Construit une archive ZIP (méthode store, sans compression). */
function zipStore(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const crc = crc32(data);
    const local = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBuf.length),
      u16(0),
      nameBuf,
      data,
    ]);
    const central = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBuf.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBuf,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const centralDir = Buffer.concat(centrals);
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);
  return Buffer.concat([...locals, centralDir, end]);
}

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function makeDocxBuffer({ titre, auteur, resume }) {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${escapeXml(titre)}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Auteur : ${escapeXml(auteur)}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Document d'exemple RPAE — DNPEC (démonstration).</w:t></w:r></w:p>
    <w:p><w:r><w:t>${escapeXml(resume)}</w:t></w:r></w:p>
    <w:sectPr/>
  </w:body>
</w:document>`;

  return zipStore([
    { name: "[Content_Types].xml", data: Buffer.from(contentTypes, "utf8") },
    { name: "_rels/.rels", data: Buffer.from(rels, "utf8") },
    { name: "word/document.xml", data: Buffer.from(document, "utf8") },
    { name: "word/_rels/document.xml.rels", data: Buffer.from(docRels, "utf8") },
  ]);
}

async function wpJson(pathName, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${pathName}`, {
    method,
    headers: {
      Authorization: auth,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${method} ${pathName} → HTTP ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function uploadMedia(filename, buffer) {
  const res = await fetch(`${API}/media`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    body: buffer,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`upload ${filename} → HTTP ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

function upsertMetaComment(html, key, value) {
  const re = new RegExp(`<!--\\s*rpae:${key}\\s+[\\s\\S]*?\\s*-->`, "i");
  const comment = `<!-- rpae:${key} ${value} -->`;
  if (re.test(html)) return html.replace(re, comment);
  // Insérer avant le premier commentaire statut ou en tête
  if (/<!--\s*rpae:statut-soumission/i.test(html)) {
    return html.replace(/(<!--\s*rpae:statut-soumission)/i, `${comment}\n$1`);
  }
  return `${comment}\n${html}`;
}

function addDownloadParagraph(html, url, filename) {
  const link = `<p><a href="${url}">Télécharger le fichier (${filename})</a></p>`;
  if (/Télécharger le fichier/i.test(html)) {
    return html.replace(/<p><a href="[^"]*">Télécharger le fichier[\s\S]*?<\/a><\/p>/i, link);
  }
  if (/<h2>Résumé<\/h2>/i.test(html)) {
    return html.replace(/(<h2>Résumé<\/h2>)/i, `${link}\n$1`);
  }
  return `${html}\n${link}`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const cats = await wpJson(`/categories?slug=rpae`);
  const categoryId = cats?.[0]?.id;
  if (!categoryId) throw new Error("Catégorie rpae introuvable — lancer d'abord npm run seed:rpae");

  const posts = await wpJson(
    `/posts?categories=${categoryId}&per_page=20&status=publish,pending&context=edit`,
  );

  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error("Aucun article RPAE trouvé");
  }

  console.log(`${posts.length} article(s) à traiter`);

  for (const post of posts) {
    const rawTitle = (post.title?.raw || post.title?.rendered || "").replace(/^\[RPAE\]\s*/i, "").trim();
    const slug = post.slug;
    const filename = `${slug}.docx`;
    const auteurMatch = (post.content?.raw || "").match(/<!--\s*rpae:prenom-auteur\s+(.+?)\s*-->/i);
    const nomMatch = (post.content?.raw || "").match(/<!--\s*rpae:nom-auteur\s+(.+?)\s*-->/i);
    const resumeMatch = (post.content?.raw || "").match(/<!--\s*rpae:resume\s+([\s\S]*?)\s*-->/i);
    const auteur = [auteurMatch?.[1], nomMatch?.[1]].filter(Boolean).join(" ") || "Auteur RPAE";
    const resume = resumeMatch?.[1]?.trim() || "Document d'exemple.";

    const buffer = makeDocxBuffer({ titre: rawTitle, auteur, resume });
    const localPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(localPath, buffer);
    console.log(`Fichier local : public/rpae-exemples/${filename}`);

    const media = await uploadMedia(filename, buffer);
    const fichierUrl = media.source_url;
    console.log(`Médias WP #${media.id} → ${fichierUrl}`);

    let content = post.content?.raw || post.content?.rendered || "";
    content = upsertMetaComment(content, "fichier-url", fichierUrl);
    content = upsertMetaComment(content, "fichier-nom", filename);
    content = addDownloadParagraph(content, fichierUrl, filename);

    await wpJson(`/posts/${post.id}`, {
      method: "POST",
      body: { content },
    });
    console.log(`Mis à jour : ${slug} (#${post.id})`);
  }

  console.log("\nTerminé : chaque article RPAE a un .docx téléchargeable.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
