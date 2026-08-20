# Assistant DNPEC (chat) — Design

Date: 2026-08-21  
Statut: validé (Phase 1)

## Objectif

Assistant IA flottant pour les visiteurs du site DNPEC. Fournisseur cible : **Claude (Anthropic)**. Phase 1 sans clé : **mode démo riche** pour convaincre les décideurs. Phase 2 : brancher `ANTHROPIC_API_KEY` sans changer l’UI.

## UX

- Bouton flottant bas-droite (au-dessus du retour-haut)
- Panneau : titre « Assistant DNPEC », sous-titre Claude, statut En ligne, badge Démo si pas de clé
- Suggestions cliquables, historique `localStorage`, i18n FR/EN
- Typing indicator + délais pour un rendu crédible

## Technique

- `POST /api/chat` : si `ANTHROPIC_API_KEY` → Claude ; sinon → moteur démo serveur
- Aucune clé exposée au client
- Contexte système : rôle DNPEC, liens internes du site, ton institutionnel

## Hors scope Phase 1

Auth, upload, voix, agent humain.
