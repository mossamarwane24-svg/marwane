#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# tests/test_events.sh — Teste hors-ligne le parseur SSE et le gestionnaire
# d'événements (lib/common.sh) avec des flux simulés. Aucun appel réseau.
#
# Usage : ./codex-agent/tests/test_events.sh
# ---------------------------------------------------------------------------
set -euo pipefail

TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$TESTS_DIR")"
# shellcheck source=../lib/common.sh
source "$APP_DIR/lib/common.sh"

PASS=0
FAIL=0

check() { # description, attendu, réel
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    PASS=$((PASS + 1)); ok "✔ $desc"
  else
    FAIL=$((FAIL + 1)); warn "✘ $desc (attendu=$expected, réel=$actual)"
  fi
}

sse() { # transforme des lignes JSON en flux SSE
  local j
  for j in "$@"; do
    printf 'event: %s\n' "$(jq -r '.type' <<<"$j")"
    printf 'data: %s\n\n' "$j"
  done
}

TMP_OUT="$(mktemp -d)"
OUTPUT_DIR="$TMP_OUT"
EVENTS_LOG_FILE="$TMP_OUT/events.jsonl"
SESSION_ID_FILE="$TMP_OUT/last_session_id"
FINAL_OUTPUT_FILE="$TMP_OUT/last_output.md"
mkdir -p "$OUTPUT_DIR"; : > "$FINAL_OUTPUT_FILE"

# --- Cas 1 : turn nominal avec web_search + deltas texte ----------------------
info "Cas 1 : turn nominal (création, environnement, outil, texte, complétion)"
EVENTS_JSON=(
  '{"type":"agent.session.created","event_id":"ev1","session":{"id":"sess_test123","status":"running"}}'
  '{"type":"agent.session.environment.ready","event_id":"ev2","environment":{"id":"env_1","status":"connected"}}'
  '{"type":"agent.session.turn.started","event_id":"ev3","turn_id":"turn_1"}'
  '{"type":"agent.session.item.created","event_id":"ev4","item":{"type":"web_search_call","status":"in_progress","action":"search","query":"agents api"}}'
  '{"type":"agent.session.turn.output_text.delta","event_id":"ev5","item_id":"msg_1","output_index":0,"content_index":0,"delta":"Bonjour "}'
  '{"type":"agent.session.turn.output_text.delta","event_id":"ev6","item_id":"msg_1","output_index":0,"content_index":0,"delta":"le monde."}'
  '{"type":"agent.session.turn.output_text.done","event_id":"ev7","item_id":"msg_1","output_index":0,"content_index":0,"text":"Bonjour le monde."}'
  '{"type":"agent.session.turn.completed","event_id":"ev8","turn":{"subagent_id":null}}'
)
rc=0
SESSION_ID=""
consume_sse_stream handle_session_event < <(sse "${EVENTS_JSON[@]}") || rc=$?
check "cas1 code retour turn terminé" 40 "$rc"
check "cas1 session id capturé" "sess_test123" "$(cat "$SESSION_ID_FILE" 2>/dev/null)"
grep -q "Bonjour le monde." "$FINAL_OUTPUT_FILE"; check "cas1 texte final archivé" 0 $?
[ "$(wc -l < "$EVENTS_LOG_FILE")" -eq 8 ]; check "cas1 journal = 8 événements" 0 $?

# --- Cas 2 : échec de turn ------------------------------------------------------
info "Cas 2 : turn échoué"
rc=0
consume_sse_stream handle_session_event < <(sse \
  '{"type":"agent.session.created","session":{"id":"sess_f"}}' \
  '{"type":"agent.session.turn.failed","turn":{"subagent_id":null,"error":{"message":"model_overloaded","code":"server_error"}}}' \
) || rc=$?
check "cas2 code retour turn échoué" 41 "$rc"

# --- Cas 3 : échec d'un sous-agent ignoré (ne termine pas le flux) --------------
info "Cas 3 : échec d'un sous-agent ne termine pas le turn racine"
rc=0
consume_sse_stream handle_session_event < <(sse \
  '{"type":"agent.session.turn.failed","turn":{"subagent_id":"sub_1","error":{"message":"boom"}}}' \
  '{"type":"agent.session.turn.completed","turn":{"subagent_id":null}}' \
) || rc=$?
check "cas3 sous-agent ignoré puis complétion" 40 "$rc"

# --- Cas 4 : requires_action ----------------------------------------------------
info "Cas 4 : action requise"
# Stub réseau : pas d'appel réel pendant les tests hors-ligne.
http_request() { HTTP_STATUS="200"; HTTP_BODY='{"required_actions":[{"type":"function_call_output","call_id":"call_1"}]}'; return 0; }
rc=0
consume_sse_stream handle_session_event < <(sse \
  '{"type":"agent.session.created","session":{"id":"sess_ra"}}' \
  '{"type":"agent.session.requires_action","session_id":"sess_ra"}' \
) || rc=$?
check "cas4 code retour action requise" 43 "$rc"

# --- Cas 5 : événement error / échec session ------------------------------------
info "Cas 5 : événement error puis échec session"
rc=0
consume_sse_stream handle_session_event < <(sse \
  '{"type":"error","error":{"message":"service_error"}}' \
) || rc=$?
check "cas5 code retour événement error" 45 "$rc"
rc=0
consume_sse_stream handle_session_event < <(sse \
  '{"type":"agent.session.failed","session":{"error":"session broken"}}' \
) || rc=$?
check "cas5b code retour échec session" 44 "$rc"

# --- Cas 6 : flux vide (déconnexion avant tout événement) ------------------------
info "Cas 6 : flux vide"
rc=0
consume_sse_stream handle_session_event < /dev/null || rc=$?
check "cas6 code retour flux vide" 50 "$rc"

# --- Cas 7 : annulation -----------------------------------------------------------
info "Cas 7 : turn annulé"
rc=0
consume_sse_stream handle_session_event < <(sse \
  '{"type":"agent.session.turn.cancelled","turn":{"subagent_id":null}}' \
) || rc=$?
check "cas7 code retour annulation" 42 "$rc"

rm -rf "$TMP_OUT"

printf '\n%sRésultats : %s réussis, %s échoué(s)%s\n' "$C_BOLD" "$PASS" "$FAIL" "$C_RESET"
[ "$FAIL" -eq 0 ] || exit 1
exit 0
