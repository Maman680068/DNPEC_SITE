# Revue scientifique RPAE — WordPress (prod)

Guide opérationnel pour brancher le back-office WordPress au site Next.js.

## Variables d'environnement

### Local (`.env.local`, jamais commité)

```
WORDPRESS_API_URL=https://VOTRE-WP/wp-json/wp/v2
WORDPRESS_APP_USER=soumah
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
RPAE_COMITE_EMAIL=comite@dnpec.gov.gn
RESEND_API_KEY=re_…
CONTACT_FROM_EMAIL=DNPEC — Site web <noreply@votredomaine.com>
```

Le mot de passe est un **Application Password** WordPress
(Utilisateurs → Profil → Mots de passe d'application), pas le mot de passe de connexion du tableau de bord.

### Render (Environment du service `dnpec-site`)

Renseigner les mêmes clés (déjà déclarées `sync: false` dans `render.yaml`) :

| Clé | Rôle |
|-----|------|
| `WORDPRESS_API_URL` | API REST (`…/wp-json/wp/v2`) — lecture catalogue + pages |
| `WORDPRESS_APP_USER` | Compte Application Password (soumissions RPAE) |
| `WORDPRESS_APP_PASSWORD` | Application Password |
| `RPAE_COMITE_EMAIL` | Destinataire des alertes de soumission |
| `RESEND_API_KEY` | Envoi e-mails (contact, newsletter, comité) |
| `CONTACT_FROM_EMAIL` | Expéditeur Resend |

Puis **redeploy** le service.

## Catégories WordPress

| Slug | Usage |
|------|--------|
| `rpae` | File comité + catalogue public après **Publier** |
| `rpae-interne` | Usage interne / commande — **jamais** dans `/revue-scientifique` |
| `en` | Actualités en anglais pour le site `/en` |

Création auto à la première soumission, ou via :

```bash
node --env-file=.env.local scripts/seed-rpae-wp.mjs
```

Le script crée aussi **5 articles publiés** et **2 en attente de relecture**.

## Site bilingue FR / EN (contenu WordPress)

L’interface Next.js bascule avec le sélecteur **FR | EN** (`/` vs `/en`).
Les **titres et textes WordPress** ne sont anglais que s’ils existent côté CMS.

### Convention éditeurs

| Type | Version FR | Version EN |
|------|------------|------------|
| Page | slug `mission` | slug `mission-en` (même contenu traduit) |
| Actualité | article FR | même article en slug `…-en` **et/ou** catégorie `en` |

Si la version EN éditoriale manque, le site **traduit automatiquement** le français (plus de bandeau « French version » dans ce cas).

### Comportement automatique du site

En mode **EN** (`/en/...`) :

1. Si une page/article `{slug}-en` existe avec un vrai texte anglais → il est affiché
2. Sinon (ou si `-en` est encore une copie française) → **traduction automatique** du contenu FR à l’affichage

Aucun texte WordPress n’est écrit en dur dans le code Next.js. Les rédacteurs peuvent ensuite remplacer la version auto par une traduction éditoriale dans WordPress (`…-en`).

### Mettre une page en anglais (édition manuelle, optionnel)

1. WordPress → **Pages** → ouvrir ou créer `{slug}-en`
2. Remplacer le contenu par la traduction validée, **Publier**
3. Recharger `/en/...` (Ctrl+F5)

Script d’amorçage (crée les `…-en` manquants) :

```bash
npm run seed:en
```

## Comptes comité

Dans WordPress → **Utilisateurs → Ajouter** :

1. Un compte **Éditeur** (ou Administrateur) par membre du comité
2. Droits : lire / modifier les articles en « En attente de relecture », publier
3. Optionnel : Application Password individuel si un outil externe doit écrire

Les auteurs du public **n'ont pas** de compte WP.

## Processus Publier / Refuser

1. Auteur soumet sur `/revue-scientifique/soumettre`
2. Article WP créé en **pending** (En attente de relecture) + catégorie `rpae` ou `rpae-interne`
3. Mail au comité (`RPAE_COMITE_EMAIL`) si Resend est configuré
4. Comité ouvre l'article, lit le fichier joint
5. **Accepter (publication)** : bouton **Publier** → visible sur le site (catégorie `rpae` uniquement)
6. **Refuser** : statut **Brouillon** + dans le contenu HTML ajouter  
   `<!-- rpae:statut-soumission refuse -->`
7. **Interne / commande** : rester en `rpae-interne`, ne pas basculer vers `rpae`

## Contenu hors RPAE

- **Actualités** : articles WP natifs (`/posts`) — déjà branchés
- **Pages institutionnelles** : pages WP avec les slugs attendus (`rpae-presentation`, etc.)
- **Publications / indicateurs / partenaires** : endpoints CPT dédiés encore absents → mock tant que non créés côté WP

## Vérification

```bash
npm run dev
# logs serveur : [wordpress] … -> OK
```

Catalogue : `/revue-scientifique` → onglet **Articles publiés**.
