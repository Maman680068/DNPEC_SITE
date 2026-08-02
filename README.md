# Site institutionnel DNPEC — Frontend Next.js

Frontend public du site de la Direction Nationale des Prévisions Économiques et
de la Conjoncture (DNPEC), République de Guinée. Application Next.js (App
Router, TypeScript, Tailwind CSS v4) conçue pour consommer, à terme, un
back-office WordPress headless — voir la section
[Connecter le WordPress headless](#connecter-le-wordpress-headless).

Réalisé à partir du cahier des charges « Refonte du site institutionnel de la
DNPEC » (juillet 2026) et de la maquette HTML de la page d'accueil validée par
le client.

## Lancer le projet en local

Prérequis : Node.js 20+ et npm.

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Autres commandes utiles :

```bash
npm run build   # build de production
npm run start   # sert le build de production
npm run lint    # ESLint
```

## Structure du projet

```
app/                        Routes (App Router)
  page.tsx                  Accueil
  la-dnpec/                 Mot du DN, Historique, Mission, Cabinet,
                             Textes réglementaires, Organigramme
  publications/              Liste avec filtres/recherche + fiche détail
  donnees/                   Secteur réel, TOFE, Balance des paiements, SMI
  actualites/                 Liste + fiches détaillées
  conferences-seminaires/    Journées scientifiques, conférences, séminaires
  revue-scientifique/        Revue + soumission d'articles
  contact/                    Formulaire, coordonnées, carte
  mentions-legales/           Mentions légales / politique de confidentialité

components/
  layout/                    Topbar, Ticker, MainNav, SiteHeader, Footer
  home/                      Hero, IndicateursSection, ActualitesSection,
                             PublicationsSection, PartnersSection, Newsletter
  ui/                        PageTitle, SectionHead, ContentPlaceholder,
                             LinkCardGrid, BackToTop
  publications/               PublicationsExplorer (filtres client)
  contact/                    ContactForm

lib/
  types.ts                    Types partagés (NewsArticle, Publication, ...)
  mock-data.ts                 Contenu de démonstration (voir plus bas)
  wordpress.ts                 Client d'accès au WordPress headless
```

La charte graphique (couleurs, typographies, espacements) est définie une
seule fois dans `app/globals.css` (`@theme`) : bleu marine `#132B5E`, vert
`#0F6B3C`, jaune `#F4C227`, rouge `#D62E27`, polices Poppins (titres) et IBM
Plex Sans (texte), chargées via `next/font` dans `app/layout.tsx`.

## Connecter le WordPress headless

Le site fonctionne dès maintenant avec des données de démonstration
(`lib/mock-data.ts`) afin que chaque page soit visualisable sans dépendance
externe. La couche `lib/wordpress.ts` interroge l'API REST WordPress dès que
`WORDPRESS_API_URL` est définie, et retombe automatiquement sur les données
mock si l'appel échoue (timeout, 404, site injoignable) — ce repli reste actif
en permanence, ce n'est pas une étape à retirer plus tard.

### Configurer `WORDPRESS_API_URL`

**En local** : créer un fichier `.env.local` à la racine du projet (jamais
commité — couvert par `.env*` dans `.gitignore`) :

```
WORDPRESS_API_URL=https://mon-wordpress.example.com/wp-json/wp/v2
```

Next.js le charge automatiquement au démarrage (`npm run dev` / `npm run
build`), sans rien configurer de plus.

**Sur Render** : la variable est déclarée dans `render.yaml` avec
`sync: false` — elle n'est pas stockée dans le dépôt. Sur le dashboard
Render du service, aller dans **Environment** et renseigner
`WORDPRESS_API_URL` avec l'URL complète de l'API REST (`.../wp-json/wp/v2`),
puis redéployer. Tant qu'elle est vide, le site sert les données mock (build
et démarrage restent fonctionnels, voir [Déployer sur
Render](#déployer-sur-render)).

**N'importe quel autre environnement** (autre hébergeur, CI, etc.) : définir
`WORDPRESS_API_URL` comme variable d'environnement standard avant `npm run
build` ou `npm run start` — `lib/wordpress.ts` ne fait aucune hypothèse sur
la plateforme.

### État actuel des endpoints

- **Actualités** (`getNews`, `getNewsBySlug`) : branchées sur `/posts`,
  l'endpoint natif de tout WordPress — fonctionne sans aucune configuration
  côté back-office, y compris sur une installation neuve. Le mapping
  (`lib/wordpress.ts`) convertit le format natif (`title.rendered`,
  `excerpt.rendered`, `_embedded` pour l'image mise en avant et la
  catégorie) vers `NewsArticle` (`lib/types.ts`).
- **Publications / Indicateurs / Partenaires** (`getPublications`,
  `getIndicators`, `getPartners`) : ciblent des endpoints dédiés
  (`/publications`, `/indicateurs`, `/partenaires`) qui n'existent pas sur
  un WordPress par défaut. Ils nécessitent, côté back-office :
  1. Des custom post types (ou une route REST sur-mesure) exposant ces
     contenus, avec les rôles éditoriaux « Rédacteur » / « Validateur-
     Publicateur » décrits au cahier des charges (workflow brouillon →
     soumis → publié).
  2. Un JSON de sortie déjà dans la forme attendue par `lib/types.ts`
     (`Publication`, `Indicator`, `Partner`), ou un ajustement du mapping
     dans `lib/wordpress.ts` si le plugin/thème utilisé structure les
     champs différemment (ACF, taxonomies, médias).

  Tant que ces endpoints ne sont pas configurés côté WordPress, ils
  répondent 404 et le site sert les données mock pour ces trois
  sections — c'est le comportement normal, pas une erreur à corriger côté
  frontend.

### Vérifier que la connexion fonctionne

Chaque appel à `lib/wordpress.ts` logue son résultat côté serveur (visible
dans le terminal en `npm run dev`, ou dans les logs Render en production) :

```
[wordpress] https://.../wp-json/wp/v2/posts?_embed&per_page=20 -> OK
[wordpress] https://.../wp-json/wp/v2/publications?_embed -> HTTP 404, repli sur les données mock
```

Un `-> OK` confirme que les données affichées viennent réellement de
WordPress ; un repli sur le mock explique pourquoi (code HTTP, erreur
réseau) sans jamais faire planter la page.

## Déployer sur Render

Le dépôt inclut un `render.yaml` (Blueprint) minimal : Render détecte
automatiquement le service Node à la racine du dépôt.

- Build : `npm ci && npm run build` — Start : `npm start` (`next start`).
- Variables optionnelles (dashboard Render → Environment) : voir
  [`docs/RPAE-WORDPRESS.md`](docs/RPAE-WORDPRESS.md) —
  `WORDPRESS_API_URL`, `WORDPRESS_APP_USER`, `WORDPRESS_APP_PASSWORD`,
  `RESEND_API_KEY`, `RPAE_COMITE_EMAIL`, `CONTACT_FROM_EMAIL`.
- `WORDPRESS_API_URL` est déclarée `sync: false` dans `render.yaml` —
  tant qu'elle est vide, le site sert les données de démonstration.
- Le port d'écoute est géré automatiquement : `next start` lit la variable
  `PORT` fournie par Render (repli sur `3000` en local) — rien à configurer.
- `NODE_VERSION` est fixée à 22 dans `render.yaml` (Next.js 16 exige Node
  ≥ 20.9 — voir le champ `engines` de `package.json`).

Pour déployer : sur Render, « New + » → « Blueprint », pointer vers ce dépôt
et cette branche ; Render lit `render.yaml` et propose le service `dnpec-site`
prêt à créer.

### Revue scientifique (RPAE)

Workflow comité WordPress, catégories `rpae` / `rpae-interne`, seed d'exemples
et variables Render : **[`docs/RPAE-WORDPRESS.md`](docs/RPAE-WORDPRESS.md)**.

```bash
npm run seed:rpae   # nécessite .env.local avec WORDPRESS_*
```

## Prochaines étapes (hors périmètre de cette itération)

- Custom post types WordPress pour publications / indicateurs / partenaires.
- Version anglaise (structure i18n une fois la traduction tranchée avec la DNPEC).
- Portail de données interactives (graphiques dynamiques, export CSV) —
  prévu en phase 2 selon le cahier des charges.
- Portail comité Next.js (option B) si la DNPEC quitte le workflow WordPress.
- Bascule de l'environnement de test Render vers l'hébergement définitif du
  ministère, une fois validé par le service informatique.
