#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# session-info.sh — Récupère l'état d'une session (statut, erreurs,
#                   actions requises, environnement). Utile après une coupure
#                   de flux ou un turn échoué.
#
# Usage : ./session-info.sh <session_id>
#         RAW=1 ./session-info.sh <session_id>   # JSON brut
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

require_deps
require_api_key
api_headers

SESSION_ARG="${1:-}"
[ -n "$SESSION_ARG" ] || die "Usage : $0 <session_id>" 4

if ! http_request GET "/agents/sessions/$SESSION_ARG"; then
  die "Échec réseau lors de la récupération de la session." 10
fi
if [ "${HTTP_STATUS:0:1}" != "2" ]; then
  report_http_error "Récupération de la session"
  exit 10
fi

if [ "${RAW:-0}" = "1" ]; then
  jq . <<<"$HTTP_BODY"
  exit 0
fi

jq -r '
  "Session        : " + (.id // "?"),
  "Statut         : " + ((.status // "?")|tostring),
  "Modèle         : " + (.agent.model // "?"),
  "Effort rais.   : " + ((.agent.reasoning.effort // "?")|tostring),
  "Environnement  : " + ((.environment.type // "none")|tostring)
    + (if .environment.id then " (id " + .environment.id + ")" else "" end),
  "Erreur         : " + ((.error // "aucune")|tostring),
  "Actions req.   : " + ((.required_actions // []) | length | tostring)
' <<<"$HTTP_BODY"

ACTIONS="$(jq -c '.required_actions // []' <<<"$HTTP_BODY")"
if [ "$ACTIONS" != "[]" ]; then
  warn "Actions requises en attente : $ACTIONS"
  info "Répondez avec : $SCRIPT_DIR/send-event.sh $SESSION_ARG <fichier-evenements.json>"
fi
exit 0
