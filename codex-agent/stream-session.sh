#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# stream-session.sh — S'abonne au flux d'événements d'une session existante
#                     (GET /v1/agents/sessions/{id}/events?stream=true).
#
# Usage : ./stream-session.sh <session_id> [--until-idle]
#   --until-idle : s'arrête dès que la session signale qu'elle est idle.
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

require_deps
require_api_key
api_headers

SESSION_ARG="${1:-}"
[ -n "$SESSION_ARG" ] || die "Usage : $0 <session_id> [--until-idle]" 4
UNTIL_IDLE=0
[ "${2:-}" = "--until-idle" ] && UNTIL_IDLE=1

info "Abonnement au flux d'événements de la session $SESSION_ARG (Ctrl+C pour quitter)…"

rc=0
if [ "$UNTIL_IDLE" = "1" ]; then
  handle_until_idle() {
    handle_session_event "$1"
    local inner=$?
    [ $inner -ne 0 ] && return $inner
    local t
    t="$(jq -r '.type // empty' <<<"$1")"
    [ "$t" = "agent.session.idle" ] && return 40
    return 0
  }
  consume_sse_stream handle_until_idle < <(
    curl -sS -N \
      --connect-timeout "${CONNECT_TIMEOUT:-30}" \
      --max-time "${STREAM_MAX_TIME:-7200}" \
      -H "Accept: text/event-stream" \
      "${API_HEADERS[@]}" \
      "$OPENAI_BASE_URL/agents/sessions/$SESSION_ARG/events?stream=true"
  ) || rc=$?
else
  consume_sse_stream handle_session_event < <(
    curl -sS -N \
      --connect-timeout "${CONNECT_TIMEOUT:-30}" \
      --max-time "${STREAM_MAX_TIME:-7200}" \
      -H "Accept: text/event-stream" \
      "${API_HEADERS[@]}" \
      "$OPENAI_BASE_URL/agents/sessions/$SESSION_ARG/events?stream=true"
  ) || rc=$?
fi

case $rc in
  0)  info "Flux fermé par le serveur."; exit 0 ;;
  40) ok "Fin du suivi (turn terminé ou session idle)."; exit 0 ;;
  50) die "Flux fermé sans aucun événement. Vérifiez l'ID de session et l'état via session-info.sh, puis réabonnez-vous." 16 ;;
  *)  explain_stream_rc $rc ;;
esac
