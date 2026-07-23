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
  enquetes/                   Postuler aux enquêtes

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
externe. La couche `lib/wordpress.ts` est prête à basculer sur un WordPress
réel :

1. Installer et configurer un WordPress classique (back-office uniquement,
   pas de thème public) avec les custom post types suivants : `actualites`,
   `publications`, `indicateurs`, `partenaires`, et les rôles éditoriaux
   « Rédacteur » / « Validateur-Publicateur » décrits au cahier des charges
   (workflow brouillon → soumis → publié).
2. Exposer l'API REST WordPress (`/wp-json/wp/v2/...`) ou WPGraphQL selon la
   préférence retenue avec le prestataire.
3. Définir la variable d'environnement `WORDPRESS_API_URL` dans un fichier
   `.env.local` (voir `.env.example` à créer) :
   ```
   WORDPRESS_API_URL=https://cms.dnpec.gov.gn/wp-json/wp/v2
   ```
4. Dans `lib/wordpress.ts`, chaque fonction (`getNews`, `getPublications`,
   `getIndicators`, `getPartners`) retombe automatiquement sur les données
   mock si l'appel échoue ou si `WORDPRESS_API_URL` n'est pas défini — retirer
   ce fallback une fois la connexion validée en recette.
5. Adapter le mapping JSON → types TypeScript (`lib/types.ts`) au schéma réel
   exposé par WordPress (champs ACF, médias, taxonomies).

## Prochaines étapes (hors périmètre de cette itération)

- Recherche plein texte sur publications et actualités.
- Formulaire de contact et newsletter : brancher l'envoi d'e-mail réel et le
  double opt-in (points marqués `TODO` dans `ContactForm.tsx` et
  `Newsletter.tsx`).
- Version anglaise (structure i18n à ajouter une fois la traduction du
  contenu tranchée avec la DNPEC).
- Portail de données interactives (graphiques dynamiques, export CSV) —
  prévu en phase 2 selon le cahier des charges.
- Déploiement de démonstration sur un hébergeur moderne (Render ou
  équivalent) avant bascule vers l'hébergement définitif du ministère.
