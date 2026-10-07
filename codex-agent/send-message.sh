#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# send-message.sh — Envoie un message de suivi à une session existante et
#                   stream la réponse. Le flux est ouvert AVANT l'envoi pour
#                   ne manquer aucun événement précoce (pattern recommandé).
#
# Usage : ./send-message.sh <session_id> "votre message"
#         echo "votre message" | ./send-message.sh <session_id>
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

require_deps
require_api_key
api_headers

SESSION_ARG="${1:-}"
[ -n "$SESSION_ARG" ] || die "Usage : $0 <session_id> \"votre message\"" 4
shift
TEXT="${*:-}"
if [ -z "$TEXT" ] && [ ! -t 0 ]; then
  TEXT="$(cat)"
fi
[ -n "$TEXT" ] || die "Aucun message fourni (argument ou stdin)." 4

# Clé d'idempotence : une par soumission logique ; à réutiliser en cas de retry.
IDEM_KEY="$(gen_uuid)"
info "Clé d'idempotence de la soumission : $IDEM_KEY"

# 1) Ouvrir le flux d'événements d'abord.
FIFO="$(mktemp -u)"
mkfifo "$FIFO"
cleanup() {
  [ -n "${STREAM_PID:-}" ] && kill "$STREAM_PID" 2>/dev/null || true
  rm -f "$FIFO"
}
trap cleanup EXIT

curl -sS -N \
  --connect-timeout "${CONNECT_TIMEOUT:-30}" \
  --max-time "${STREAM_MAX_TIME:-7200}" \
  -H "Accept: text/event-stream" \
  "${API_HEADERS[@]}" \
  "$OPENAI_BASE_URL/agents/sessions/$SESSION_ARG/events?stream=true" \
  > "$FIFO" &
STREAM_PID=$!

# Petite temporisation pour laisser l'abonnement s'établir avant l'envoi.
sleep 1

# 2) Envoyer le message (agent.session.input.message).
EVENTS_PAYLOAD="$(mktemp)"
jq -n --arg text "$TEXT" '{
  events: [
    {
      type: "agent.session.input.message",
      input: [ { role: "user", content: [ { type: "input_text", text: $text } ] } ]
    }
  ]
}' > "$EVENTS_PAYLOAD"

info "Envoi du message à la session $SESSION_ARG…"
attempt=0
while :; do
  attempt=$((attempt + 1))
  if http_request POST "/agents/sessions/$SESSION_ARG/events" "$EVENTS_PAYLOAD"; then
    if [ "${HTTP_STATUS:0:1}" = "2" ]; then
      ok "Message soumis."
      break
    fi
    report_http_error "Envoi du message de suivi"
    if is_transient_status "$HTTP_STATUS" && [ "$attempt" -le "${CREATE_RETRIES:-3}" ]; then
      delay=$((2 ** attempt))
      warn "Nouvelle tentative dans ${delay}s (même clé d'idempotence)…"
      sleep "$delay"
      continue
    fi
    die "Envoi du message impossible (HTTP $HTTP_STATUS)." 10
  fi
  die "Échec réseau lors de l'envoi du message." 10
done
rm -f "$EVENTS_PAYLOAD"

# 3) Consommer le flux jusqu'à la fin du turn.
info "Suivi de la réponse…"
rc=0
consume_sse_stream handle_session_event < "$FIFO" || rc=$?
[ $rc -eq 0 ] && rc=50

case $rc in
  40) print_artifacts_summary; ok "Turn de suivi terminé." ;;
  50) die "Le flux s'est fermé avant la fin du turn. Récupérez l'état sauvegardé (session-info.sh / list-items.sh) puis réabonnez-vous (stream-session.sh)." 16 ;;
  *)  explain_stream_rc $rc ;;
esac
