# Module WordPress `dnpec-content-api.php`

Module « must-use » du WordPress headless de la DNPEC (TasteWP). Il fournit
au site Next.js les contenus Publications, Partenaires (et Indicateurs, en
secours) et le journal des validations de l'espace contributeurs
(`/espace-contributeurs`). Version actuelle : **2.2.0**.

Ce fichier est la référence : la copie installée sur WordPress doit lui être
identique.

## Installation / mise à jour

1. Ouvrir le gestionnaire de fichiers de l'hébergement WordPress (TasteWP :
   *File Manager*), ou se connecter en SFTP.
2. Aller dans `wp-content/mu-plugins/` (créer le dossier `mu-plugins` s'il
   n'existe pas).
3. Remplacer `dnpec-content-api.php` par ce fichier, tel quel.
4. Rien à activer : WordPress charge automatiquement les modules de ce
   dossier. Vérifier dans *Extensions → Extensions indispensables* que
   « DNPEC — API contenu » apparaît en version 2.2.0.

Prérequis : le plugin **JWT Authentication for WP REST API** (connexion de
l'espace contributeurs), déjà installé sur TasteWP, avec sa clé
`JWT_AUTH_SECRET_KEY` dans `wp-config.php`.

## Ce que fait le module

- **Types de contenu privés** : Publications, Partenaires, Indicateurs (non
  affichés par le site tant que `data/donnees.json` existe), et le Journal
  des validations (rempli automatiquement).
- **Statut décidé par WordPress** : un contenu créé par quelqu'un qui peut
  publier (`publish_posts` : administrateur, éditeur, auteur) est publié ;
  sinon il part « en attente de relecture ». Le statut envoyé par le
  navigateur n'est jamais repris.
- **Modération** (publier / rejeter) réservée aux administrateurs et
  éditeurs (`edit_others_posts`). Rejeter = brouillon + marqueur « rejeté »
  (rien n'est supprimé). Chaque action est inscrite au journal, avec le nom
  de la personne connectée.
- **Journal infalsifiable** : sur les articles (`/wp/v2/posts`), le champ
  `dnpec_log_action` n'est pris en compte que si l'action a réellement eu
  lieu et si la personne avait le droit de la faire.
- **Téléversement** : le rôle Contributeur reçoit le droit de téléverser,
  limité aux images (JPG, PNG, GIF, WebP) et aux PDF de 8 Mo au plus.
- **Liens filtrés** : site web, fichier PDF et lien de destination
  n'acceptent qu'une adresse `http(s)://` (ou un chemin du site commençant
  par `/` pour le lien de destination) — jamais `javascript:`.

## Routes REST (`/wp-json/wp/v2/…`)

| Route | Méthode | Qui | Rôle |
|---|---|---|---|
| `/publications`, `/partenaires`, `/indicateurs` | GET | tout le monde | Liste. Visiteur : contenus publiés. Personne connectée : publiés + ses propres contenus (tous statuts) + ceux des autres si elle peut les modifier. |
| `/…/{id}` | GET | tout le monde | Un élément publié, ou non publié si la personne peut le modifier. |
| `/…` | POST | `edit_posts` | Créer. Statut décidé par les droits (publié ou en attente). `slug` et `order` acceptés seulement pour un administrateur/éditeur (import de la liste par défaut). |
| `/…/{id}` | PUT | `edit_post` sur cet élément | Modifier les champs. Le statut n'est pas modifiable ici ; un contributeur qui corrige son contenu rejeté le renvoie en relecture. |
| `/…/{id}/moderation` | POST `{ "action": "publier" \| "rejeter" }` | `edit_others_posts` + `publish_posts` | Publier, ou rejeter (brouillon + marqueur). Inscrit l'action au journal. |
| `/journal` | GET | `edit_posts` | 200 dernières entrées du journal (lecture seule). |
| `/posts` (champ `dnpec_log_action`) | PUT | voir ci-dessus | Inscrit au journal la publication ou le rejet d'une actualité ou d'un article RPAE fait depuis l'espace contributeurs. |

Champs : Publications → `title`, `description`, `type`, `year`, `fileUrl`,
`fileSizeKb`, `href` ; Partenaires → `title` (nom), `websiteUrl`,
`featuredMediaId` (logo, image de la médiathèque) ; Indicateurs → `title`,
`value`, `icon`, `tone`, `period`.
