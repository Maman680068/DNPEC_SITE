# Assistant DNPEC — Plan d’implémentation (Phase 1)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `lib/chat/types.ts` | Types messages / réponse API |
| `lib/chat/demo-engine.ts` | Réponses démo DNPEC (FR/EN) |
| `app/api/chat/route.ts` | Claude si clé, sinon démo |
| `components/chat/ChatWidget.tsx` | Bouton + panneau + historique |
| `lib/i18n/messages.ts` | Chaînes chat |
| `app/layout.tsx` | Monter le widget |
| `components/ui/BackToTop.tsx` | Remonter pour ne pas chevaucher |

## Tests manuels

1. Ouvrir le site → bulle visible bas-droite
2. Ouvrir le chat → suggestions + message d’accueil
3. Cliquer « Mission » → réponse structurée + liens
4. Mode EN → textes EN
5. Sans `ANTHROPIC_API_KEY` → badge Démo, réponses OK
