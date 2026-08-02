/**
 * Seed WordPress RPAE — catégories + 5 articles publiés + 2 en attente.
 *
 * Usage (depuis la racine du projet) :
 *   node --env-file=.env.local scripts/seed-rpae-wp.mjs
 *
 * Prérequis dans .env.local :
 *   WORDPRESS_API_URL=https://…/wp-json/wp/v2
 *   WORDPRESS_APP_USER=…
 *   WORDPRESS_APP_PASSWORD=…   (Application Password, espaces OK)
 */

const API = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");
const USER = process.env.WORDPRESS_APP_USER;
const PASS = process.env.WORDPRESS_APP_PASSWORD?.replace(/\s+/g, "");

if (!API || !USER || !PASS) {
  console.error(
    "Variables manquantes. Définir WORDPRESS_API_URL, WORDPRESS_APP_USER et WORDPRESS_APP_PASSWORD dans .env.local",
  );
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${USER}:${PASS}`).toString("base64")}`;

async function wp(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: auth,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → HTTP ${res.status} ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }
  return data;
}

async function ensureCategory(slug, name, description) {
  const existing = await wp(`/categories?slug=${encodeURIComponent(slug)}`);
  if (existing?.[0]?.id) {
    console.log(`Catégorie ${slug} déjà présente (id=${existing[0].id})`);
    return existing[0].id;
  }
  const created = await wp("/categories", {
    method: "POST",
    body: { name, slug, description },
  });
  console.log(`Catégorie ${slug} créée (id=${created.id})`);
  return created.id;
}

function rpaeContent(meta) {
  const lines = [
    `<!-- rpae:nom-auteur ${meta.nom} -->`,
    `<!-- rpae:prenom-auteur ${meta.prenom} -->`,
    `<!-- rpae:email-auteur ${meta.email} -->`,
    `<!-- rpae:profil-auteur ${meta.profil} -->`,
    `<!-- rpae:grade-auteur ${meta.grade} -->`,
    `<!-- rpae:fonction-auteur ${meta.fonction} -->`,
    `<!-- rpae:usage ${meta.usage} -->`,
    `<!-- rpae:theme ${meta.theme} -->`,
    `<!-- rpae:edition-annee ${meta.edition} -->`,
    `<!-- rpae:titre-article ${meta.titre} -->`,
    `<!-- rpae:resume ${meta.resume} -->`,
    `<!-- rpae:statut-soumission ${meta.statut} -->`,
    "",
    "<h2>Résumé</h2>",
    `<p>${meta.resume}</p>`,
    `<p><strong>Auteur :</strong> ${meta.prenom} ${meta.nom} — <strong>Profil :</strong> ${meta.profil} — <strong>Thème :</strong> ${meta.theme}</p>`,
  ];
  return lines.join("\n");
}

const published = [
  {
    slug: "inflation-et-pouvoir-achat-en-guinee-2025",
    titre: "Inflation et pouvoir d'achat en Guinée : une analyse conjoncturelle",
    nom: "Diallo",
    prenom: "Aïssatou",
    email: "a.diallo@exemple.gn",
    profil: "etudiant",
    grade: "Master 2",
    fonction: "Université Gamal Abdel Nasser de Conakry",
    theme: "Inflation",
    edition: "2026",
    date: "2026-03-15T10:00:00",
    resume:
      "Cette étude examine la dynamique de l'inflation guinéenne et ses effets sur le pouvoir d'achat des ménages entre 2023 et 2025.",
  },
  {
    slug: "finances-publiques-et-soutenabilite-de-la-dette",
    titre: "Finances publiques et soutenabilité de la dette en Guinée",
    nom: "Camara",
    prenom: "Mamadou",
    email: "m.camara@exemple.gn",
    profil: "docteur",
    grade: "Économie publique",
    fonction: "Chercheur indépendant",
    theme: "Finances publiques",
    edition: "2026",
    date: "2026-01-20T10:00:00",
    resume:
      "Analyse de la trajectoire d'endettement public et des marges de manœuvre budgétaires à moyen terme.",
  },
  {
    slug: "secteur-minier-et-recettes-fiscales",
    titre: "Secteur minier et recettes fiscales : quels leviers pour l'État ?",
    nom: "Bah",
    prenom: "Fatoumata",
    email: "f.bah@exemple.gn",
    profil: "professeur",
    grade: "Professeur titulaire",
    fonction: "Université de Conakry",
    theme: "Secteur minier",
    edition: "2025",
    date: "2025-11-08T10:00:00",
    resume:
      "Contribution sur le lien entre exploitation minière, fiscalité et capacité de financement des politiques publiques.",
  },
  {
    slug: "commerce-exterieur-et-balance-des-paiements-2024",
    titre: "Commerce extérieur et balance des paiements : lecture 2024",
    nom: "Sow",
    prenom: "Ibrahima",
    email: "i.sow@exemple.gn",
    profil: "expert",
    grade: "Économiste",
    fonction: "Consultant indépendant",
    theme: "Commerce extérieur",
    edition: "2025",
    date: "2025-09-12T10:00:00",
    resume:
      "Synthèse des flux commerciaux et des comptes de la balance des paiements, avec focus sur les termes de l'échange.",
  },
  {
    slug: "emploi-des-jeunes-et-croissance-inclusive",
    titre: "Emploi des jeunes et croissance inclusive en Guinée",
    nom: "Keita",
    prenom: "Mariama",
    email: "m.keita@exemple.gn",
    profil: "etudiant",
    grade: "Master 1",
    fonction: "Université Général Lansana Conté de Sonfonia",
    theme: "Emploi",
    edition: "2026",
    date: "2026-02-02T10:00:00",
    resume:
      "Exploration des déterminants de l'insertion professionnelle des jeunes et des leviers de politiques publiques.",
  },
];

const pending = [
  {
    slug: "politique-monetaire-et-stabilite-des-prix",
    titre: "Politique monétaire et stabilité des prix : enjeux pour 2026",
    nom: "Touré",
    prenom: "Sekou",
    email: "s.toure@exemple.gn",
    profil: "docteur",
    grade: "Macroéconomie",
    fonction: "Analyste",
    theme: "Politique monétaire",
    edition: "2026",
    date: "2026-07-20T10:00:00",
    resume:
      "Proposition d'article soumis au comité — analyse des canaux de transmission monétaire en Guinée.",
  },
  {
    slug: "integration-regionale-et-commerce-intra-cedeao",
    titre: "Intégration régionale et commerce intra-CEDEAO",
    nom: "Condé",
    prenom: "Aminata",
    email: "a.conde@exemple.gn",
    profil: "expert",
    grade: "Chercheuse associée",
    fonction: "Think tank régional",
    theme: "Intégration régionale",
    edition: "2026",
    date: "2026-07-28T10:00:00",
    resume:
      "Article en attente de relecture — opportunités et freins au commerce intra-communautaire.",
  },
];

async function upsertPost(article, { status, categoryId, usage, statut }) {
  const existing = await wp(`/posts?slug=${encodeURIComponent(article.slug)}&status=publish,pending,draft,private`);
  const content = rpaeContent({
    ...article,
    usage,
    statut,
  });
  const body = {
    title: `[RPAE] ${article.titre}`,
    content,
    status,
    slug: article.slug,
    date: article.date,
    categories: [categoryId],
  };

  if (existing?.[0]?.id) {
    const updated = await wp(`/posts/${existing[0].id}`, { method: "POST", body });
    console.log(`Mis à jour (${status}) : ${updated.slug} #${updated.id}`);
    return updated;
  }

  const created = await wp("/posts", { method: "POST", body });
  console.log(`Créé (${status}) : ${created.slug} #${created.id}`);
  return created;
}

async function main() {
  console.log(`API : ${API}`);
  const me = await wp("/users/me");
  console.log(`Connecté en tant que : ${me.name || me.slug || me.id}`);

  const publicCat = await ensureCategory(
    "rpae",
    "RPAE",
    "Articles de la Revue des Prévisions et Analyses Économiques — file comité DNPEC",
  );
  await ensureCategory(
    "rpae-interne",
    "RPAE interne",
    "Travaux RPAE à usage interne ou sur commande — exclus du catalogue public",
  );

  for (const article of published) {
    await upsertPost(article, {
      status: "publish",
      categoryId: publicCat,
      usage: "publication",
      statut: "publie",
    });
  }

  for (const article of pending) {
    await upsertPost(article, {
      status: "pending",
      categoryId: publicCat,
      usage: "publication",
      statut: "soumis",
    });
  }

  console.log("\nSeed terminé : 5 publiés + 2 en attente (catégorie rpae).");
  console.log("Comptes comité : créer manuellement dans WP → Utilisateurs (rôle Éditeur).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
