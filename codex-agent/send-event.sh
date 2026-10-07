#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# send-event.sh — Envoie des événements bruts à une session
#                 (POST /v1/agents/sessions/{id}/events).
#
# Sert notamment à répondre aux appels d'outils/fonctions quand la session
# passe en `agent.session.requires_action` : on renvoie un événement
# `agent.session.input.function_call_output` (ou une annulation
# `agent.session.input.cancel`).
#
# Usage :
#   ./send-event.sh <session_id> <fichier-evenements.json>
#   ./send-event.sh <session_id> -        # lit le JSON depuis stdin
#   ./send-event.sh <session_id> --cancel # envoie agent.session.input.cancel
#
# Exemple de fichier pour répondre à un appel de fonction :
#   {
#     "events": [
#       {
#         "type": "agent.session.input.function_call_output",
#         "call_id": "<call_id du function_call>",
#         "output": "{\"reponse\": 42}"
#       }
#     ]
#   }
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

require_deps
require_api_key
api_headers

SESSION_ARG="${1:-}"
SOURCE="${2:-}"
[ -n "$SESSION_ARG" ] && [ -n "$SOURCE" ] || die "Usage : $0 <session_id> <fichier.json | - | --cancel>" 4

PAYLOAD="$(mktemp)"
trap 'rm -f "$PAYLOAD"' EXIT

if [ "$SOURCE" = "--cancel" ]; then
  info "Envoi d'une annulation du turn en cours…"
  printf '{"events":[{"type":"agent.session.input.cancel"}]}' > "$PAYLOAD"
elif [ "$SOURCE" = "-" ]; then
  cat > "$PAYLOAD"
else
  [ -f "$SOURCE" ] || die "Fichier introuvable : $SOURCE" 4
  cat "$SOURCE" > "$PAYLOAD"
fi

jq -e '.events | type == "array" and length > 0' "$PAYLOAD" >/dev/null \
  || die "JSON invalide : un objet {\"events\": [...]} non vide est attendu." 4

IDEM_KEY="$(gen_uuid)"
info "Clé d'idempotence : $IDEM_KEY"

attempt=0
while :; do
  attempt=$((attempt + 1))
  if http_request POST "/agents/sessions/$SESSION_ARG/events" "$PAYLOAD"; then
    if [ "${HTTP_STATUS:0:1}" = "2" ]; then
      ok "Événement(s) envoyé(s) à la session $SESSION_ARG."
      info "Suivez la suite avec : $SCRIPT_DIR/stream-session.sh $SESSION_ARG"
      exit 0
    fi
    report_http_error "Envoi d'événements"
    if is_transient_status "$HTTP_STATUS" && [ "$attempt" -le "${CREATE_RETRIES:-3}" ]; then
      sleep $((2 ** attempt))
      continue
    fi
    die "Envoi impossible (HTTP $HTTP_STATUS)." 10
  fi
  die "Échec réseau lors de l'envoi d'événements." 10
done
