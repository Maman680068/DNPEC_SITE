<?php
/**
 * Plugin Name: DNPEC — API contenu (Publications / Indicateurs / Partenaires)
 * Description: Recrée les endpoints REST /wp-json/wp/v2/publications, /indicateurs
 *              et /partenaires consommés par le site Next.js DNPEC (lib/wordpress.ts
 *              pour la lecture publique, lib/admin/* pour l'espace contributeurs),
 *              perdus lors de la migration depuis TasteWP. Version 2 : ajoute la
 *              création/modification depuis l'espace contributeurs (authentifiée via
 *              le plugin JWT Authentication for WP REST API) et un journal
 *              d'audit des validations/rejets. Aucune dépendance à un thème ou à un
 *              autre plugin (pas d'ACF requis) — 100% autonome.
 * Version:     2.2.0 — modération par action (publier / rejeter) décidée
 *              selon les droits WordPress, journal infalsifiable, lecture
 *              limitée à ses propres brouillons pour un contributeur, URL
 *              filtrées (http/https ou chemin du site), téléversement
 *              d'images et de PDF (8 Mo) accordé aux contributeurs, import
 *              de la liste par défaut (identifiant et ordre conservés).
 *              2.1.0 : journal distinguant articles RPAE et actualités.
 * Author:      DNPEC
 *
 * Installation : wp-content/mu-plugins/dnpec-content-api.php — remplace le fichier
 * existant tel quel (mêmes instructions que la v1, aucune activation manuelle).
 *
 * Ce fichier fait quatre choses :
 *   1. Enregistre 3 custom post types privés (Publications, Indicateurs,
 *      Partenaires) avec des champs meta natifs et des écrans d'édition
 *      simples dans wp-admin (inchangé depuis la v1).
 *   2. Enregistre un 4ᵉ custom post type privé, `dnpec_journal`, qui sert de
 *      journal d'audit (qui a validé/rejeté quoi, et quand) — rempli
 *      automatiquement par ce fichier, jamais à la main.
 *   3. Routes REST publiques en lecture (`GET /wp-json/wp/v2/publications` etc.) :
 *      contenu publié uniquement pour un visiteur anonyme (site public,
 *      inchangé) ; TOUS les statuts (brouillon/en attente/publié) pour un
 *      utilisateur connecté ayant le droit de modifier ce type de contenu
 *      (espace contributeurs).
 *   4. Routes REST authentifiées en écriture (créer / modifier, et
 *      /moderation pour publier ou rejeter) pour ces 3 types, avec statut automatique selon les droits
 *      WordPress de la personne connectée (publie directement si elle en a
 *      le droit, sinon "en attente de relecture") — et journalisation de
 *      chaque publication/rejet déclenché depuis l'espace contributeurs.
 */

if (!defined('ABSPATH')) {
    exit; // Accès direct interdit.
}

// -----------------------------------------------------------------------
// 0. Prérequis pour l'image des partenaires (image mise en avant).
// -----------------------------------------------------------------------

add_action('after_setup_theme', function () {
    if (!current_theme_supports('post-thumbnails')) {
        add_theme_support('post-thumbnails');
    }
});

// -----------------------------------------------------------------------
// 1. Custom post types (contenu)
// -----------------------------------------------------------------------

add_action('init', function () {
    register_post_type('dnpec_publication', [
        'labels' => [
            'name'          => 'Publications',
            'singular_name' => 'Publication',
            'add_new_item'  => 'Ajouter une publication',
            'edit_item'     => 'Modifier la publication',
            'all_items'     => 'Publications',
        ],
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'menu_icon'          => 'dashicons-media-document',
        'show_in_rest'       => false, // routes REST personnalisées fournies plus bas
        'supports'           => ['title', 'page-attributes'],
        'capability_type'    => 'post',
        'has_archive'        => false,
        'rewrite'            => false,
        'query_var'          => false,
    ]);

    register_post_type('dnpec_indicateur', [
        'labels' => [
            'name'          => 'Indicateurs',
            'singular_name' => 'Indicateur',
            'add_new_item'  => 'Ajouter un indicateur',
            'edit_item'     => "Modifier l'indicateur",
            'all_items'     => 'Indicateurs',
        ],
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'menu_icon'          => 'dashicons-chart-line',
        'show_in_rest'       => false,
        'supports'           => ['title', 'page-attributes'],
        'capability_type'    => 'post',
        'has_archive'        => false,
        'rewrite'            => false,
        'query_var'          => false,
    ]);

    register_post_type('dnpec_partenaire', [
        'labels' => [
            'name'          => 'Partenaires',
            'singular_name' => 'Partenaire',
            'add_new_item'  => 'Ajouter un partenaire',
            'edit_item'     => 'Modifier le partenaire',
            'all_items'     => 'Partenaires',
        ],
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'menu_icon'          => 'dashicons-groups',
        'show_in_rest'       => false,
        'supports'           => ['title', 'thumbnail', 'page-attributes'],
        'capability_type'    => 'post',
        'has_archive'        => false,
        'rewrite'            => false,
        'query_var'          => false,
    ]);

    // Journal d'audit : jamais édité à la main, rempli par dnpec_log_action()
    // ci-dessous. show_ui à true uniquement pour pouvoir le consulter/purger
    // manuellement en cas de besoin technique — l'espace contributeurs a sa
    // propre page de consultation (lecture seule) via la route REST dédiée.
    register_post_type('dnpec_journal', [
        'labels' => [
            'name'          => 'Journal des validations (DNPEC)',
            'singular_name' => 'Entrée de journal',
            'all_items'     => 'Journal des validations',
        ],
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'menu_icon'          => 'dashicons-list-view',
        'show_in_rest'       => false,
        'supports'           => ['title'],
        'capability_type'    => 'post',
        'has_archive'        => false,
        'rewrite'            => false,
        'query_var'          => false,
    ]);
});

// -----------------------------------------------------------------------
// 2. Champs meta (register_post_meta — natif WordPress, pas d'ACF requis)
// -----------------------------------------------------------------------

add_action('init', function () {
    $text_field = [
        'show_in_rest'      => true,
        'single'            => true,
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => 'dnpec_can_edit_meta',
    ];
    $url_field = $text_field;
    $url_field['sanitize_callback'] = 'dnpec_sanitize_http_url';

    $textarea_field = $text_field;
    $textarea_field['sanitize_callback'] = 'sanitize_textarea_field';

    $int_field = [
        'show_in_rest'      => true,
        'single'            => true,
        'type'              => 'integer',
        'sanitize_callback' => 'absint',
        'auth_callback'     => 'dnpec_can_edit_meta',
    ];

    // -- dnpec_publication : Publication (lib/types.ts) -----------------
    register_post_meta('dnpec_publication', 'dnpec_description', $textarea_field);
    register_post_meta('dnpec_publication', 'dnpec_type', $text_field);
    register_post_meta('dnpec_publication', 'dnpec_year', $int_field);
    register_post_meta('dnpec_publication', 'dnpec_file_url', $url_field);
    register_post_meta('dnpec_publication', 'dnpec_file_size_kb', $int_field);
    register_post_meta('dnpec_publication', 'dnpec_href', $text_field);

    // -- dnpec_indicateur : Indicator (lib/types.ts) --------------------
    register_post_meta('dnpec_indicateur', 'dnpec_value', $text_field);
    register_post_meta('dnpec_indicateur', 'dnpec_icon', $text_field);
    register_post_meta('dnpec_indicateur', 'dnpec_tone', $text_field);
    register_post_meta('dnpec_indicateur', 'dnpec_period', $text_field);

    // -- dnpec_partenaire : Partner (lib/types.ts) ----------------------
    register_post_meta('dnpec_partenaire', 'dnpec_website_url', $url_field);

    // -- dnpec_journal : entrée d'audit ----------------------------------
    register_post_meta('dnpec_journal', 'dnpec_actor_id', $int_field);
    register_post_meta('dnpec_journal', 'dnpec_actor_name', $text_field);
    register_post_meta('dnpec_journal', 'dnpec_action', $text_field);
    register_post_meta('dnpec_journal', 'dnpec_entity_type', $text_field);
    register_post_meta('dnpec_journal', 'dnpec_entity_id', $int_field);
    register_post_meta('dnpec_journal', 'dnpec_entity_title', $text_field);
});

function dnpec_can_edit_meta() {
    return current_user_can('edit_posts');
}

// -----------------------------------------------------------------------
// 3. Écrans d'édition wp-admin (meta boxes natives, sans ACF)
// -----------------------------------------------------------------------

add_action('add_meta_boxes', function () {
    add_meta_box('dnpec_publication_fields', 'Détails de la publication', 'dnpec_render_publication_metabox', 'dnpec_publication', 'normal', 'high');
    add_meta_box('dnpec_indicateur_fields', "Détails de l'indicateur", 'dnpec_render_indicateur_metabox', 'dnpec_indicateur', 'normal', 'high');
    add_meta_box('dnpec_partenaire_fields', 'Détails du partenaire', 'dnpec_render_partenaire_metabox', 'dnpec_partenaire', 'normal', 'high');
});

/**
 * Les 8 valeurs de `type` attendues côté site (filtre de la page
 * /publications, voir publicationTypes dans lib/mock-data.ts).
 */
function dnpec_publication_type_choices() {
    return [
        'previsionnels'         => 'Documents prévisionnels',
        'budgetaires'            => 'Documents budgétaires',
        'conjoncturels'          => 'Documents conjoncturels',
        'integration-regionale'  => "Documents de suivi de l'intégration économique régionale",
        'politique-economique'   => 'Documents de politique économique',
        'analyses-etudes'        => "Documents d'analyse et d'études économiques",
        'travail'                => 'Documents de travail',
        'statistiques'           => 'Documents statistiques',
    ];
}

function dnpec_render_publication_metabox($post) {
    wp_nonce_field('dnpec_save_publication', 'dnpec_publication_nonce');
    $description = get_post_meta($post->ID, 'dnpec_description', true);
    $type        = get_post_meta($post->ID, 'dnpec_type', true);
    $year        = get_post_meta($post->ID, 'dnpec_year', true);
    $file_url    = get_post_meta($post->ID, 'dnpec_file_url', true);
    $file_size   = get_post_meta($post->ID, 'dnpec_file_size_kb', true);
    $href        = get_post_meta($post->ID, 'dnpec_href', true);
    ?>
    <p>
        <label for="dnpec_description"><strong>Description</strong></label><br>
        <textarea id="dnpec_description" name="dnpec_description" rows="3" style="width:100%;"><?php echo esc_textarea($description); ?></textarea>
    </p>
    <p>
        <label for="dnpec_type"><strong>Type</strong></label><br>
        <select id="dnpec_type" name="dnpec_type">
            <option value="">— Choisir —</option>
            <?php foreach (dnpec_publication_type_choices() as $value => $label): ?>
                <option value="<?php echo esc_attr($value); ?>" <?php selected($type, $value); ?>><?php echo esc_html($label); ?></option>
            <?php endforeach; ?>
        </select>
    </p>
    <p>
        <label for="dnpec_year"><strong>Année</strong></label><br>
        <input type="number" id="dnpec_year" name="dnpec_year" value="<?php echo esc_attr($year); ?>" style="width:120px;">
    </p>
    <p>
        <label for="dnpec_file_url"><strong>URL du fichier (PDF)</strong></label><br>
        <input type="url" id="dnpec_file_url" name="dnpec_file_url" value="<?php echo esc_attr($file_url); ?>" style="width:100%;" placeholder="https://cms.dnpec.gov.gn/wp-content/uploads/...">
    </p>
    <p>
        <label for="dnpec_file_size_kb"><strong>Taille du fichier (Ko, optionnel)</strong></label><br>
        <input type="number" id="dnpec_file_size_kb" name="dnpec_file_size_kb" value="<?php echo esc_attr($file_size); ?>" style="width:120px;">
    </p>
    <p>
        <label for="dnpec_href"><strong>Lien de destination (optionnel, sinon /publications/{slug})</strong></label><br>
        <input type="text" id="dnpec_href" name="dnpec_href" value="<?php echo esc_attr($href); ?>" style="width:100%;">
    </p>
    <?php
}

function dnpec_render_indicateur_metabox($post) {
    wp_nonce_field('dnpec_save_indicateur', 'dnpec_indicateur_nonce');
    $value  = get_post_meta($post->ID, 'dnpec_value', true);
    $icon   = get_post_meta($post->ID, 'dnpec_icon', true);
    $tone   = get_post_meta($post->ID, 'dnpec_tone', true);
    $period = get_post_meta($post->ID, 'dnpec_period', true);
    ?>
    <p><em>Le titre de l'article ci-dessus sert de libellé (ex. « Taux de croissance réel »). Le slug (identifiant) sert de clé d'icône côté site — utiliser de préférence : croissance, inflation, deficit, endettement, courant.</em></p>
    <p>
        <label for="dnpec_value"><strong>Valeur affichée</strong></label><br>
        <input type="text" id="dnpec_value" name="dnpec_value" value="<?php echo esc_attr($value); ?>" style="width:100%;" placeholder="ex. 7,2 %">
    </p>
    <p>
        <label for="dnpec_icon"><strong>Icône (emoji, optionnel)</strong></label><br>
        <input type="text" id="dnpec_icon" name="dnpec_icon" value="<?php echo esc_attr($icon); ?>" style="width:80px;" placeholder="📈">
    </p>
    <p>
        <label for="dnpec_tone"><strong>Couleur</strong></label><br>
        <select id="dnpec_tone" name="dnpec_tone">
            <?php foreach (['green' => 'Vert', 'yellow' => 'Jaune', 'red' => 'Rouge', 'navy' => 'Bleu marine'] as $value => $label): ?>
                <option value="<?php echo esc_attr($value); ?>" <?php selected($tone, $value); ?>><?php echo esc_html($label); ?></option>
            <?php endforeach; ?>
        </select>
    </p>
    <p>
        <label for="dnpec_period"><strong>Période</strong></label><br>
        <input type="text" id="dnpec_period" name="dnpec_period" value="<?php echo esc_attr($period); ?>" style="width:100%;" placeholder="ex. nov-2025">
    </p>
    <?php
}

function dnpec_render_partenaire_metabox($post) {
    wp_nonce_field('dnpec_save_partenaire', 'dnpec_partenaire_nonce');
    $website_url = get_post_meta($post->ID, 'dnpec_website_url', true);
    ?>
    <p><em>Le titre de l'article ci-dessus sert de nom du partenaire. Utiliser l'image mise en avant (colonne de droite) pour le logo.</em></p>
    <p><em>Pour afficher un partenaire dans la rangée du bas plutôt que dans le bandeau défilant, utiliser exactement le slug (identifiant) <code>simandou</code> ou <code>guinee</code>.</em></p>
    <p>
        <label for="dnpec_website_url"><strong>Site web (optionnel)</strong></label><br>
        <input type="url" id="dnpec_website_url" name="dnpec_website_url" value="<?php echo esc_attr($website_url); ?>" style="width:100%;" placeholder="https://...">
    </p>
    <?php
}

add_action('save_post_dnpec_publication', function ($post_id) {
    if (!isset($_POST['dnpec_publication_nonce']) || !wp_verify_nonce($_POST['dnpec_publication_nonce'], 'dnpec_save_publication')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['dnpec_description'])) update_post_meta($post_id, 'dnpec_description', sanitize_textarea_field(wp_unslash($_POST['dnpec_description'])));
    if (isset($_POST['dnpec_type'])) update_post_meta($post_id, 'dnpec_type', sanitize_text_field(wp_unslash($_POST['dnpec_type'])));
    if (isset($_POST['dnpec_year']) && $_POST['dnpec_year'] !== '') update_post_meta($post_id, 'dnpec_year', absint($_POST['dnpec_year']));
    if (isset($_POST['dnpec_file_url'])) update_post_meta($post_id, 'dnpec_file_url', dnpec_sanitize_http_url(wp_unslash($_POST['dnpec_file_url'])));
    if (isset($_POST['dnpec_file_size_kb']) && $_POST['dnpec_file_size_kb'] !== '') update_post_meta($post_id, 'dnpec_file_size_kb', absint($_POST['dnpec_file_size_kb']));
    if (isset($_POST['dnpec_href'])) update_post_meta($post_id, 'dnpec_href', dnpec_sanitize_link(wp_unslash($_POST['dnpec_href'])));
});

add_action('save_post_dnpec_indicateur', function ($post_id) {
    if (!isset($_POST['dnpec_indicateur_nonce']) || !wp_verify_nonce($_POST['dnpec_indicateur_nonce'], 'dnpec_save_indicateur')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    foreach (['dnpec_value', 'dnpec_icon', 'dnpec_tone', 'dnpec_period'] as $field) {
        if (isset($_POST[$field])) update_post_meta($post_id, $field, sanitize_text_field(wp_unslash($_POST[$field])));
    }
});

add_action('save_post_dnpec_partenaire', function ($post_id) {
    if (!isset($_POST['dnpec_partenaire_nonce']) || !wp_verify_nonce($_POST['dnpec_partenaire_nonce'], 'dnpec_save_partenaire')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['dnpec_website_url'])) update_post_meta($post_id, 'dnpec_website_url', dnpec_sanitize_http_url(wp_unslash($_POST['dnpec_website_url'])));
});

// -----------------------------------------------------------------------
// 4. Journal d'audit — écriture interne uniquement
// -----------------------------------------------------------------------

/**
 * Enregistre une entrée d'audit. Appelée uniquement par ce fichier, après
 * une action de modération réellement effectuée : l'acteur et l'heure
 * viennent du contexte serveur, jamais d'une valeur envoyée par le client.
 */
function dnpec_log_action(string $action, string $entity_type, int $entity_id, string $entity_title) {
    $user = wp_get_current_user();
    $actor_name = $user && $user->exists() ? $user->display_name : 'Inconnu';
    $actor_id = $user && $user->exists() ? $user->ID : 0;

    $labels = ['publier' => 'a publié', 'rejeter' => 'a rejeté'];
    $verb = $labels[$action] ?? $action;
    $title = sprintf('%s %s : %s', $actor_name, $verb, $entity_title);

    wp_insert_post([
        'post_type'   => 'dnpec_journal',
        'post_status' => 'publish',
        'post_title'  => $title,
        'meta_input'  => [
            'dnpec_actor_id'     => $actor_id,
            'dnpec_actor_name'   => $actor_name,
            'dnpec_action'       => $action,
            'dnpec_entity_type'  => $entity_type,
            'dnpec_entity_id'    => $entity_id,
            'dnpec_entity_title' => $entity_title,
        ],
    ]);
}

/**
 * Peut modérer (publier / rejeter) le contenu d'un autre : administrateur ou
 * éditeur (« Rédacteur en chef »). Un Auteur publie ses propres contenus
 * mais ne modère pas ceux des autres.
 */
function dnpec_can_moderate(): bool {
    return current_user_can('edit_others_posts') && current_user_can('publish_posts');
}

/**
 * Champ virtuel accepté en écriture sur /wp/v2/posts (actualités, RPAE) :
 * inscrit une entrée de journal en même temps qu'un PUT de modération. Écrit
 * seulement si l'action a réellement eu lieu et si la personne avait le
 * droit de la faire (le changement de statut est déjà appliqué quand ce
 * rappel s'exécute) — un contributeur ne peut donc pas inscrire une fausse
 * validation. N'est jamais renvoyé en lecture.
 */
add_action('rest_api_init', function () {
    register_rest_field('post', 'dnpec_log_action', [
        'update_callback' => function ($value, $post) {
            if (!is_string($value) || !in_array($value, ['publier', 'rejeter'], true)) return;
            if (!dnpec_can_moderate() || !current_user_can('edit_post', $post->ID)) return;
            $status = get_post_status($post->ID);
            if ($value === 'publier' && $status !== 'publish') return;
            if ($value === 'rejeter' && $status !== 'draft') return;
            // Un article WordPress "post" est soit une actualité, soit un
            // article RPAE (catégorie rpae / rpae-interne).
            $isRpae = has_category(['rpae', 'rpae-interne'], $post->ID);
            dnpec_log_action($value, $isRpae ? 'rpae' : 'actualite', $post->ID, get_the_title($post->ID));
        },
        'schema' => ['type' => 'string'],
    ]);
});

// -----------------------------------------------------------------------
// 5. Téléversement de fichiers par les contributeurs
// -----------------------------------------------------------------------

const DNPEC_CONTRIBUTOR_MAX_UPLOAD = 8 * 1024 * 1024; // 8 Mo

/** Contributeur (rôle sans droit natif de téléversement) qui reçoit ce droit ci-dessous. */
function dnpec_is_limited_uploader($user = null): bool {
    $user = $user ?: wp_get_current_user();
    return $user && $user->exists() && in_array('contributor', (array) $user->roles, true);
}

/**
 * Le rôle Contributeur n'a pas `upload_files` dans WordPress : il ne pourrait
 * ni joindre une image à son article ni déposer le PDF d'une publication.
 * On lui accorde ce droit, limité aux images et aux PDF de 8 Mo au plus.
 */
add_filter('user_has_cap', function ($allcaps, $caps, $args, $user) {
    if (in_array('upload_files', (array) $caps, true) && dnpec_is_limited_uploader($user)) {
        $allcaps['upload_files'] = true;
    }
    return $allcaps;
}, 10, 4);

add_filter('upload_mimes', function ($mimes) {
    if (!dnpec_is_limited_uploader()) return $mimes;
    return [
        'jpg|jpeg|jpe' => 'image/jpeg',
        'png'          => 'image/png',
        'gif'          => 'image/gif',
        'webp'         => 'image/webp',
        'pdf'          => 'application/pdf',
    ];
});

function dnpec_limit_contributor_upload($file) {
    if (!dnpec_is_limited_uploader()) return $file;
    // Envoi via l'API REST (corps brut) : WordPress ne renseigne pas 'size', on lit le fichier temporaire.
    $size = !empty($file['size']) ? (int) $file['size'] : (!empty($file['tmp_name']) && is_file($file['tmp_name']) ? (int) filesize($file['tmp_name']) : 0);
    if ($size > DNPEC_CONTRIBUTOR_MAX_UPLOAD) {
        $file['error'] = 'Fichier trop volumineux (8 Mo maximum).';
        return $file;
    }
    $check = wp_check_filetype($file['name'] ?? '');
    if (empty($check['type'])) {
        $file['error'] = 'Type de fichier non autorisé : images (JPG, PNG, GIF, WebP) et PDF uniquement.';
    }
    return $file;
}
add_filter('wp_handle_upload_prefilter', 'dnpec_limit_contributor_upload');
add_filter('wp_handle_sideload_prefilter', 'dnpec_limit_contributor_upload');

// -----------------------------------------------------------------------
// 6. Routes REST — lecture (publique + espace contributeurs) et écriture
//    (espace contributeurs uniquement) pour les types de contenu.
// -----------------------------------------------------------------------

add_action('rest_api_init', function () {
    foreach (dnpec_content_type_configs() as $slug => $config) {
        register_rest_route('wp/v2', "/$slug", [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => function (WP_REST_Request $request) use ($config) {
                    return dnpec_rest_list($config);
                },
                'permission_callback' => '__return_true', // filtrage par statut et par auteur dans le rappel
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => function (WP_REST_Request $request) use ($config) {
                    return dnpec_rest_create($config, $request);
                },
                'permission_callback' => function () use ($config) {
                    return current_user_can($config['edit_cap']);
                },
            ],
        ]);

        register_rest_route('wp/v2', "/$slug/(?P<id>\\d+)", [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => function (WP_REST_Request $request) use ($config) {
                    return dnpec_rest_get_one($config, (int) $request['id']);
                },
                'permission_callback' => '__return_true', // contrôle par élément dans le rappel
            ],
            [
                'methods'             => 'PUT,PATCH',
                'callback'            => function (WP_REST_Request $request) use ($config) {
                    return dnpec_rest_update($config, $request, (int) $request['id']);
                },
                'permission_callback' => function (WP_REST_Request $request) use ($config) {
                    $post = get_post((int) $request['id']);
                    return $post && $post->post_type === $config['post_type'] && current_user_can('edit_post', $post->ID);
                },
            ],
        ]);

        // Modération : publier ou rejeter (brouillon + marqueur), décidé ici
        // à partir des droits WordPress — jamais d'un statut envoyé par le client.
        register_rest_route('wp/v2', "/$slug/(?P<id>\\d+)/moderation", [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => function (WP_REST_Request $request) use ($config) {
                return dnpec_rest_moderate($config, $request, (int) $request['id']);
            },
            'permission_callback' => function (WP_REST_Request $request) use ($config) {
                $post = get_post((int) $request['id']);
                return $post && $post->post_type === $config['post_type']
                    && current_user_can('edit_post', $post->ID) && dnpec_can_moderate();
            },
        ]);
    }

    // Journal : lecture seule, réservée aux personnes connectées pouvant éditer du contenu.
    register_rest_route('wp/v2', '/journal', [
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 'dnpec_rest_get_journal',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);
});

/** Configuration par type : post_type WP, champs meta ↔ champs JSON, capacité requise. */
function dnpec_content_type_configs(): array {
    return [
        'publications' => [
            'post_type' => 'dnpec_publication',
            'edit_cap'  => 'edit_posts',
            'entity'    => 'publication',
            'fields'    => [
                'description' => ['meta' => 'dnpec_description', 'type' => 'string', 'sanitize' => 'sanitize_textarea_field'],
                'type'        => ['meta' => 'dnpec_type', 'type' => 'string', 'sanitize' => 'dnpec_sanitize_publication_type'],
                'year'        => ['meta' => 'dnpec_year', 'type' => 'int'],
                'fileUrl'     => ['meta' => 'dnpec_file_url', 'type' => 'string', 'sanitize' => 'dnpec_sanitize_http_url'],
                'fileSizeKb'  => ['meta' => 'dnpec_file_size_kb', 'type' => 'int'],
                'href'        => ['meta' => 'dnpec_href', 'type' => 'string', 'sanitize' => 'dnpec_sanitize_link'],
            ],
        ],
        'indicateurs' => [
            'post_type' => 'dnpec_indicateur',
            'edit_cap'  => 'edit_posts',
            'entity'    => 'indicateur',
            'fields'    => [
                'value'  => ['meta' => 'dnpec_value', 'type' => 'string', 'sanitize' => 'sanitize_text_field'],
                'icon'   => ['meta' => 'dnpec_icon', 'type' => 'string', 'sanitize' => 'sanitize_text_field'],
                'tone'   => ['meta' => 'dnpec_tone', 'type' => 'string', 'sanitize' => 'sanitize_text_field'],
                'period' => ['meta' => 'dnpec_period', 'type' => 'string', 'sanitize' => 'sanitize_text_field'],
            ],
        ],
        'partenaires' => [
            'post_type' => 'dnpec_partenaire',
            'edit_cap'  => 'edit_posts',
            'entity'    => 'partenaire',
            'fields'    => [
                'websiteUrl' => ['meta' => 'dnpec_website_url', 'type' => 'string', 'sanitize' => 'dnpec_sanitize_http_url'],
            ],
        ],
    ];
}

/** URL absolue http(s) uniquement (pas de javascript:, data:, ftp:…). */
function dnpec_sanitize_http_url($value) {
    $value = trim((string) $value);
    if ($value === '') return '';
    return esc_url_raw($value, ['http', 'https']);
}

/** Lien de destination : chemin relatif du site (« /… ») ou URL http(s). */
function dnpec_sanitize_link($value) {
    $value = trim((string) $value);
    if ($value === '') return '';
    if ($value[0] === '/' && substr($value, 0, 2) !== '//' && strpos($value, '\\') === false) {
        return sanitize_text_field($value);
    }
    return dnpec_sanitize_http_url($value);
}

function dnpec_sanitize_publication_type($value) {
    $value = sanitize_text_field((string) $value);
    return array_key_exists($value, dnpec_publication_type_choices()) ? $value : '';
}

function dnpec_strip_empty(array $item) {
    return array_filter($item, function ($value) {
        return $value !== '' && $value !== null;
    });
}

/**
 * Lecture : visiteur anonyme → publiés uniquement (site public). Personne
 * connectée avec droit d'édition → publiés + ses propres contenus (tous
 * statuts) + ceux des autres seulement si elle peut les modifier
 * (administrateur, éditeur).
 */
function dnpec_rest_list(array $config) {
    $can_edit = is_user_logged_in() && current_user_can($config['edit_cap']);
    $statuses = $can_edit ? ['publish', 'pending', 'draft'] : ['publish'];

    $posts = get_posts([
        'post_type'      => $config['post_type'],
        'post_status'    => $statuses,
        'posts_per_page' => -1,
        'orderby'        => ['menu_order' => 'ASC', 'title' => 'ASC'],
        'no_found_rows'  => true,
    ]);

    $visible = array_filter($posts, function ($post) {
        return $post->post_status === 'publish' || current_user_can('edit_post', $post->ID);
    });

    return new WP_REST_Response(array_values(array_map(function ($post) use ($config) {
        return dnpec_format_item($config, $post);
    }, $visible)), 200);
}

function dnpec_rest_get_one(array $config, int $id) {
    $post = get_post($id);
    if (!$post || $post->post_type !== $config['post_type']) {
        return new WP_Error('dnpec_not_found', 'Introuvable.', ['status' => 404]);
    }
    $can_see = $post->post_status === 'publish' || (is_user_logged_in() && current_user_can('edit_post', $id));
    if (!$can_see) {
        return new WP_Error('dnpec_forbidden', 'Non autorisé.', ['status' => 403]);
    }
    return new WP_REST_Response(dnpec_format_item($config, $post), 200);
}

function dnpec_format_item(array $config, WP_Post $post) {
    $item = [
        'id'    => (string) $post->ID,
        'slug'  => $post->post_name,
        'title' => get_the_title($post),
        'status' => $post->post_status,
        'rejected' => (bool) get_post_meta($post->ID, 'dnpec_rejete', true),
        'authorId'   => (int) $post->post_author,
        'authorName' => get_the_author_meta('display_name', $post->post_author) ?: null,
    ];

    foreach ($config['fields'] as $jsonKey => $fieldConfig) {
        $raw = get_post_meta($post->ID, $fieldConfig['meta'], true);
        if ($fieldConfig['type'] === 'int') {
            $item[$jsonKey] = $raw !== '' ? (int) $raw : null;
        } else {
            $item[$jsonKey] = (string) $raw;
        }
    }

    // Publications : titre = label WP natif ; libellé "label" pour indicateurs/partenaires (cohérence avec Indicator/Partner).
    if ($config['post_type'] === 'dnpec_indicateur') {
        $item['label'] = $item['title'];
        unset($item['title']);
    }
    if ($config['post_type'] === 'dnpec_partenaire') {
        $item['name'] = $item['title'];
        unset($item['title']);
        $logo = get_the_post_thumbnail_url($post->ID, 'full');
        $item['logoUrl'] = $logo ?: null;
    }

    $item = dnpec_strip_empty($item);
    if (empty($item['rejected'])) unset($item['rejected']);
    return $item;
}

/** Image mise en avant : seulement une image existante de la médiathèque. */
function dnpec_apply_featured_media(int $post_id, WP_REST_Request $request) {
    $featured = (int) $request->get_param('featuredMediaId');
    if ($featured <= 0) return;
    if (get_post_type($featured) !== 'attachment' || !wp_attachment_is_image($featured)) return;
    set_post_thumbnail($post_id, $featured);
}

function dnpec_rest_create(array $config, WP_REST_Request $request) {
    $title = sanitize_text_field((string) $request->get_param('title'));
    if ($title === '') {
        return new WP_Error('dnpec_invalid', 'Le titre est obligatoire.', ['status' => 400]);
    }

    // Statut décidé par les droits WordPress : publié si la personne peut publier, sinon en attente.
    $status = current_user_can('publish_posts') ? 'publish' : 'pending';

    $postarr = [
        'post_type'   => $config['post_type'],
        'post_status' => $status,
        'post_title'  => $title,
        'post_author' => get_current_user_id(),
    ];
    // Import de la liste par défaut (administrateur) : identifiant et ordre d'affichage conservés.
    if (current_user_can('edit_others_posts')) {
        $slug = sanitize_title((string) $request->get_param('slug'));
        if ($slug !== '') $postarr['post_name'] = $slug;
        if ($request->get_param('order') !== null) $postarr['menu_order'] = (int) $request->get_param('order');
    }

    $post_id = wp_insert_post($postarr, true);
    if (is_wp_error($post_id)) {
        return new WP_Error('dnpec_create_failed', $post_id->get_error_message(), ['status' => 500]);
    }

    dnpec_apply_fields($config, $post_id, $request);
    dnpec_apply_featured_media($post_id, $request);

    return new WP_REST_Response(dnpec_format_item($config, get_post($post_id)), 201);
}

/**
 * Modification des champs uniquement. Le statut n'est pas accepté ici (voir
 * la route /moderation) ; seule exception : un contributeur qui corrige son
 * propre contenu rejeté le renvoie en relecture.
 */
function dnpec_rest_update(array $config, WP_REST_Request $request, int $id) {
    $post = get_post($id);
    if (!$post || $post->post_type !== $config['post_type']) {
        return new WP_Error('dnpec_not_found', 'Introuvable.', ['status' => 404]);
    }

    $update = ['ID' => $id];

    $title = $request->get_param('title');
    if ($title !== null) {
        $update['post_title'] = sanitize_text_field((string) $title);
    }

    $resubmit = $post->post_status === 'draft' && !current_user_can('publish_posts')
        && (int) $post->post_author === get_current_user_id();
    if ($resubmit) {
        $update['post_status'] = 'pending';
        delete_post_meta($id, 'dnpec_rejete');
    }

    if (count($update) > 1) {
        $result = wp_update_post($update, true);
        if (is_wp_error($result)) {
            return new WP_Error('dnpec_update_failed', $result->get_error_message(), ['status' => 500]);
        }
    }

    dnpec_apply_fields($config, $id, $request);
    dnpec_apply_featured_media($id, $request);

    return new WP_REST_Response(dnpec_format_item($config, get_post($id)), 200);
}

/** Publier ou rejeter (brouillon + marqueur), puis inscription au journal. */
function dnpec_rest_moderate(array $config, WP_REST_Request $request, int $id) {
    $action = $request->get_param('action');
    if (!in_array($action, ['publier', 'rejeter'], true)) {
        return new WP_Error('dnpec_invalid', 'Action invalide (publier ou rejeter).', ['status' => 400]);
    }

    $result = wp_update_post([
        'ID'          => $id,
        'post_status' => $action === 'publier' ? 'publish' : 'draft',
    ], true);
    if (is_wp_error($result)) {
        return new WP_Error('dnpec_update_failed', $result->get_error_message(), ['status' => 500]);
    }

    if ($action === 'publier') {
        delete_post_meta($id, 'dnpec_rejete');
    } else {
        update_post_meta($id, 'dnpec_rejete', 1);
    }

    dnpec_log_action($action, $config['entity'], $id, get_the_title($id));

    return new WP_REST_Response(dnpec_format_item($config, get_post($id)), 200);
}

function dnpec_apply_fields(array $config, int $post_id, WP_REST_Request $request) {
    foreach ($config['fields'] as $jsonKey => $fieldConfig) {
        $value = $request->get_param($jsonKey);
        if ($value === null) continue;

        if ($fieldConfig['type'] === 'int') {
            update_post_meta($post_id, $fieldConfig['meta'], absint($value));
        } else {
            $sanitize = $fieldConfig['sanitize'] ?? 'sanitize_text_field';
            update_post_meta($post_id, $fieldConfig['meta'], call_user_func($sanitize, (string) $value));
        }
    }
}

function dnpec_rest_get_journal(WP_REST_Request $request) {
    $posts = get_posts([
        'post_type'      => 'dnpec_journal',
        'post_status'    => 'publish',
        'posts_per_page' => 200,
        'orderby'        => 'date',
        'order'          => 'DESC',
        'no_found_rows'  => true,
    ]);

    $items = array_map(function ($post) {
        return [
            'id'         => (string) $post->ID,
            'date'       => $post->post_date_gmt . 'Z',
            'actorId'    => (int) get_post_meta($post->ID, 'dnpec_actor_id', true),
            'actorName'  => (string) get_post_meta($post->ID, 'dnpec_actor_name', true),
            'action'     => (string) get_post_meta($post->ID, 'dnpec_action', true),
            'entityType' => (string) get_post_meta($post->ID, 'dnpec_entity_type', true),
            'entityId'   => (int) get_post_meta($post->ID, 'dnpec_entity_id', true),
            'entityTitle' => (string) get_post_meta($post->ID, 'dnpec_entity_title', true),
        ];
    }, $posts);

    return new WP_REST_Response($items, 200);
}
