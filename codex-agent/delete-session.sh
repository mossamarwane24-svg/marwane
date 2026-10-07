#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# delete-session.sh — Supprime une session (et demande le nettoyage de son
#                     sandbox). Un 409 signifie qu'un travail est encore en
#                     cours : on réessaie quelques fois avec un délai.
#
# Usage : ./delete-session.sh <session_id>
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

MAX_ATTEMPTS=5
attempt=0
while :; do
  attempt=$((attempt + 1))
  if ! http_request DELETE "/agents/sessions/$SESSION_ARG"; then
    die "Échec réseau lors de la suppression." 10
  fi
  case "$HTTP_STATUS" in
    2*)
      ok "Session $SESSION_ARG supprimée : $(jq -c . <<<"$HTTP_BODY" 2>/dev/null || echo "$HTTP_BODY")"
      exit 0
      ;;
    409)
      if [ "$attempt" -lt "$MAX_ATTEMPTS" ]; then
        warn "Suppression en conflit (setup ou exécution en cours) — tentative $attempt/$MAX_ATTEMPTS, nouvel essai dans $((attempt * 2))s…"
        sleep $((attempt * 2))
        continue
      fi
      report_http_error "Suppression de la session"
      die "Trop de tentatives de suppression en conflit." 10
      ;;
    *)
      report_http_error "Suppression de la session"
      exit 10
      ;;
  esac
done
