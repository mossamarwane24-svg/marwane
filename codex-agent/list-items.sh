#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# list-items.sh — Récupère le travail sauvegardé d'une session (items) :
#                 messages et appels d'outils, y compris après coupure du flux.
#
# Usage : ./list-items.sh <session_id> [limite]
#         RAW=1 ./list-items.sh <session_id>   # JSON brut
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

require_deps
require_api_key
api_headers

SESSION_ARG="${1:-}"
LIMIT="${2:-100}"
[ -n "$SESSION_ARG" ] || die "Usage : $0 <session_id> [limite]" 4

if ! http_request GET "/agents/sessions/$SESSION_ARG/items?order=asc&limit=$LIMIT"; then
  die "Échec réseau lors de la récupération des items." 10
fi
if [ "${HTTP_STATUS:0:1}" != "2" ]; then
  report_http_error "Récupération des items"
  exit 10
fi

if [ "${RAW:-0}" = "1" ]; then
  jq . <<<"$HTTP_BODY"
  exit 0
fi

COUNT="$(jq -r '.data | length' <<<"$HTTP_BODY")"
info "$COUNT item(s) sauvegardé(s) pour la session $SESSION_ARG :"
jq -r '
  .data[]
  | "- [" + (.type // "?") + "]"
    + (if .role then " role=" + .role else "" end)
    + (if .status then " status=" + (.status|tostring) else "" end)
    + (if .name then " name=" + .name else "" end)
    + (
        ((.content // []) | map(select(.type=="output_text") | .text) | join(" ")) as $t
        | if ($t|length) > 0 then "\n    texte: " + ($t | if length > 300 then .[0:300] + "…" else . end) else "" end
      )
' <<<"$HTTP_BODY"

HAS_MORE="$(jq -r '.has_more // false' <<<"$HTTP_BODY")"
[ "$HAS_MORE" = "true" ] && info "D'autres items existent (has_more=true) : augmentez la limite ou paginez avec after=…"
exit 0
