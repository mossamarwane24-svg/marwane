#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# run.sh — Démarre une session de l'agent sauvegardé "Codex" via l'Agents API,
#          envoie un message utilisateur initial et stream la sortie/événements.
#
# Usage :
#   ./run.sh                     # utilise INITIAL_INPUT de config.env
#   ./run.sh "Votre message"     # message initial personnalisé
#   DRY_RUN=1 ./run.sh           # imprime la requête sans appeler l'API
#
# Prérequis : export OPENAI_API_KEY="sk-..."  (voir README.md)
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

require_deps
[ "$DRY_RUN" = "1" ] || require_api_key

INITIAL_INPUT="${1:-$INITIAL_INPUT}"
[ -n "$INITIAL_INPUT" ] || die "Aucun message initial fourni (argument ou INITIAL_INPUT dans config.env)." 4

reset_output_artifacts
api_headers

PAYLOAD_FILE="$PAYLOAD_DIR/create_session.json"
build_create_payload "$INITIAL_INPUT" "$PAYLOAD_FILE"

if [ "$DRY_RUN" = "1" ]; then
  info "DRY_RUN=1 — requête qui serait envoyée :"
  info "POST $OPENAI_BASE_URL/agents/sessions"
  info "En-têtes : Authorization: Bearer <OPENAI_API_KEY>, OpenAI-Beta: agents=v1, OpenAI-Project: $OPENAI_PROJECT_ID, Content-Type: application/json"
  jq . "$PAYLOAD_FILE"
  exit 0
fi

info "Agent sauvegardé : ${C_BOLD}${AGENT_NAME:-?}${C_RESET} ($AGENT_ID)"
info "Projet OpenAI    : $OPENAI_PROJECT_ID"
info "Modèle (override) : $(jq -r '.model' "$PAYLOAD_FILE") — raisonnement effort=$(jq -r '.reasoning.effort' "$PAYLOAD_FILE"), verbosity=$(jq -r '.text.verbosity' "$PAYLOAD_FILE")"
info "Environnement    : $(jq -c '.environment' "$PAYLOAD_FILE")"
info "Envoi du message initial à l'agent…"

# --- Création de session en streaming, avec retries sur erreurs transitoires ---
# Une clé d'idempotence unique par soumission logique permet de réessayer sans
# créer de session en double.
IDEM_KEY="$(gen_uuid)"
STREAM_RC=0
attempt=0
while :; do
  attempt=$((attempt + 1))
  STREAM_RC=0
  consume_sse_stream handle_session_event < <(
    curl -sS -N \
      --connect-timeout "${CONNECT_TIMEOUT:-30}" \
      --max-time "${CREATE_MAX_TIME:-7200}" \
      -H "Idempotency-Key: $IDEM_KEY" \
      "${API_HEADERS[@]}" \
      -d "@$PAYLOAD_FILE" \
      "$OPENAI_BASE_URL/agents/sessions"
  ) || STREAM_RC=$?

  [ $STREAM_RC -eq 0 ] && STREAM_RC=50 # flux clos sans événement terminal
  [ $STREAM_RC -eq 40 ] && break       # turn terminé avec succès

  # Flux fermé sans événement (erreur HTTP probable ou coupure réseau) :
  # on rejoue la même requête avec la même clé d'idempotence pour récupérer
  # soit l'erreur, soit la session déjà créée.
  if [ $STREAM_RC -eq 50 ]; then
    info "Le flux s'est fermé sans événement (tentative $attempt). Vérification avec la même clé d'idempotence…"
    probe_status=""
    if http_request POST "/agents/sessions" "$PAYLOAD_FILE"; then
      probe_status="$HTTP_STATUS"
      if [ "${probe_status:0:1}" = "2" ]; then
        SESSION_ID="$(jq -r '.id // empty' <<<"$HTTP_BODY")"
        if [ -n "$SESSION_ID" ]; then
          printf '%s' "$SESSION_ID" > "$SESSION_ID_FILE"
          ok "Session existante récupérée : $SESSION_ID"
          info "Bascule sur le flux d'événements de la session…"
          exec "$SCRIPT_DIR/stream-session.sh" "$SESSION_ID"
        fi
      fi
      report_http_error "Création de la session"
      if is_transient_status "$probe_status" && [ "$attempt" -le "${CREATE_RETRIES:-3}" ]; then
        delay=$((2 ** attempt))
        warn "Nouvelle tentative dans ${delay}s (clé d'idempotence conservée)…"
        sleep "$delay"
        continue
      fi
      die "Création de session impossible (HTTP $probe_status)." 10
    fi
    # Échec réseau complet de la sonde.
    if [ "$attempt" -le "${CREATE_RETRIES:-3}" ]; then
      delay=$((2 ** attempt))
      warn "Réseau indisponible — nouvelle tentative dans ${delay}s…"
      sleep "$delay"
      continue
    fi
    die "Réseau indisponible après $attempt tentatives." 10
  fi

  # Autre code : condition terminale remontée par le gestionnaire d'événements.
  explain_stream_rc "$STREAM_RC"
  break
done

print_artifacts_summary
ok "Terminé. Pour continuer la conversation : $SCRIPT_DIR/send-message.sh $SESSION_ID \"votre message\""
