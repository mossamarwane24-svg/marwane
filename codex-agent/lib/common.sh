#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# lib/common.sh — Fonctions partagées pour piloter l'Agents API d'OpenAI
# directement avec curl + jq (aucun SDK requis).
#
# Documentation de référence :
#   https://developers.openai.com/api/docs/guides/agents-api/overview
# ---------------------------------------------------------------------------

set -o pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$LIB_DIR")"
REPO_ROOT="$(dirname "$APP_DIR")"

# Charge la configuration (valeurs par défaut surchargées par l'environnement).
# shellcheck source=../config.env
source "$APP_DIR/config.env"

# La clé est lue dans l'environnement (jamais stockée dans le dépôt).
OPENAI_API_KEY="${OPENAI_API_KEY:-}"

OUTPUT_DIR="${OUTPUT_DIR:-$REPO_ROOT/output}"
EVENTS_LOG_FILE="$OUTPUT_DIR/events.jsonl"
SESSION_ID_FILE="$OUTPUT_DIR/last_session_id"
FINAL_OUTPUT_FILE="$OUTPUT_DIR/last_output.md"
PAYLOAD_DIR="$OUTPUT_DIR/.payloads"

# --- Couleurs ---------------------------------------------------------------
if [ -t 1 ] && [ "${NO_COLOR:-}" = "" ]; then
  C_RESET=$'\033[0m'; C_BOLD=$'\033[1m'; C_DIM=$'\033[2m'
  C_CYAN=$'\033[36m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
  C_RED=$'\033[31m'; C_MAGENTA=$'\033[35m'
else
  C_RESET=""; C_BOLD=""; C_DIM=""; C_CYAN=""; C_GREEN=""; C_YELLOW=""; C_RED=""; C_MAGENTA=""
fi

info() { printf '%s[info]%s %s\n' "$C_CYAN" "$C_RESET" "$*" >&2; }
ok()   { printf '%s[ ok ]%s %s\n' "$C_GREEN" "$C_RESET" "$*" >&2; }
warn() { printf '%s[warn]%s %s\n' "$C_YELLOW" "$C_RESET" "$*" >&2; }
die()  { printf '%s[err ]%s %s\n' "$C_RED" "$C_RESET" "$*" >&2; exit "${2:-1}"; }

# --- Dépendances et prérequis -------------------------------------------------
require_deps() {
  local missing=()
  command -v curl >/dev/null 2>&1 || missing+=("curl")
  command -v jq   >/dev/null 2>&1 || missing+=("jq")
  if [ "${#missing[@]}" -gt 0 ]; then
    die "Dépendances manquantes : ${missing[*]}. Installez-les (ex. : sudo apt-get install curl jq ou brew install curl jq)." 2
  fi
}

require_api_key() {
  if [ -z "${OPENAI_API_KEY:-}" ]; then
    die "La variable OPENAI_API_KEY est absente. Exportez-la d'abord : export OPENAI_API_KEY=\"sk-...\"" 3
  fi
}

# En-têtes requis par l'Agents API (bêta) :
#   - OpenAI-Beta: agents=v1  (obligatoire pour les endpoints /v1/agents)
#   - OpenAI-Project          (projette la requête dans le projet demandé)
API_HEADERS=()
api_headers() {
  API_HEADERS=(
    -H "Authorization: Bearer ${OPENAI_API_KEY:-}"
    -H "OpenAI-Beta: agents=v1"
    -H "Content-Type: application/json"
  )
  if [ -n "${OPENAI_PROJECT_ID:-}" ]; then
    API_HEADERS+=(-H "OpenAI-Project: $OPENAI_PROJECT_ID")
  fi
}

# --- Utilitaires ---------------------------------------------------------------
gen_uuid() {
  if command -v uuidgen >/dev/null 2>&1; then
    uuidgen | tr '[:upper:]' '[:lower:]'
  elif [ -r /proc/sys/kernel/random/uuid ]; then
    cat /proc/sys/kernel/random/uuid
  else
    od -x /dev/urandom | head -1 | awk '{OFS="-"; print $2$3,$4,$5,$6,$7$8$9}'
  fi
}

# Réinitialise les artefacts de sortie de la dernière exécution.
reset_output_artifacts() {
  mkdir -p "$OUTPUT_DIR" "$PAYLOAD_DIR"
  : > "$FINAL_OUTPUT_FILE"
  if [ "${EVENTS_LOG:-1}" = "1" ]; then : > "$EVENTS_LOG_FILE"; fi
}

# --- Requêtes HTTP non streamées ----------------------------------------------
# http_request METHODE CHEMIN [FICHIER_BODY]
# Résultat dans HTTP_STATUS (code) et HTTP_BODY (corps). Retourne 1 si curl échoue.
HTTP_STATUS=""
HTTP_BODY=""
http_request() {
  local method="$1" path="$2" body_file="${3:-}"
  local tmp_body tmp_err
  tmp_body="$(mktemp)"; tmp_err="$(mktemp)"
  local -a curl_args=(
    -sS -X "$method"
    -o "$tmp_body" -w '%{http_code}'
    --connect-timeout "${CONNECT_TIMEOUT:-30}"
    --max-time "${REQUEST_MAX_TIME:-600}"
    "${API_HEADERS[@]}"
  )
  [ -n "$body_file" ] && curl_args+=(-d "@$body_file")
  curl_args+=("$OPENAI_BASE_URL$path")

  if ! HTTP_STATUS="$(curl "${curl_args[@]}" 2>"$tmp_err")"; then
    warn "Échec réseau curl : $(tr -d '\n' < "$tmp_err")"
    HTTP_STATUS="000"; HTTP_BODY=""
    rm -f "$tmp_body" "$tmp_err"
    return 1
  fi
  rm -f "$tmp_err"
  HTTP_BODY="$(cat "$tmp_body")"
  rm -f "$tmp_body"
  return 0
}

# Analyse le corps d'une erreur HTTP OpenAI et affiche un diagnostic utile.
report_http_error() {
  local contexte="$1"
  local etype ecode emsg eparam
  etype="$(jq -r '.error.type // empty' <<<"$HTTP_BODY" 2>/dev/null)"
  ecode="$(jq -r '.error.code // empty' <<<"$HTTP_BODY" 2>/dev/null)"
  emsg="$(jq -r '.error.message // empty' <<<"$HTTP_BODY" 2>/dev/null)"
  eparam="$(jq -r '.error.param // empty' <<<"$HTTP_BODY" 2>/dev/null)"

  warn "$contexte — HTTP $HTTP_STATUS${etype:+, type=$etype}${ecode:+, code=$ecode}"
  [ -n "$emsg" ]   && warn "Message : $emsg"
  [ -n "$eparam" ] && warn "Champ en cause (error.param) : $eparam"

  case "$HTTP_STATUS:$ecode" in
    400:agent_not_persisted)
      warn "L'agent_id fourni correspond à un agent local de session. Utilisez un agent sauvegardé (AGENT_ID)." ;;
    400:invalid_beta)
      warn "En-tête OpenAI-Beta invalide ; attendu : OpenAI-Beta: agents=v1" ;;
    401:*|403:*)
      warn "Authentification refusée. Vérifiez OPENAI_API_KEY et ses portées (api.agents.read, api.agents.write, api.responses.write), ainsi que le projet OPENAI_PROJECT_ID." ;;
    404:*)
      warn "Ressource introuvable. Vérifiez AGENT_ID, l'ID de session, le modèle et que la ressource appartient au projet $OPENAI_PROJECT_ID." ;;
    409:executor_version_incompatible)
      warn "Version d'executor incompatible (environnement self-hosted). Mettez à jour l'executor puis réessayez." ;;
    409:*)
      warn "Conflit d'état (ex. suppression pendant qu'un turn s'exécute). Patientez puis réessayez." ;;
    429:files_api_rate_limit_exceeded)
      warn "Limite de débit de la Files API atteinte. Réduisez les requêtes concurrentes et réessayez avec backoff." ;;
    429:*)
      warn "Limite de débit atteinte. Réessayez avec un délai croissant." ;;
    500:*|503:*)
      warn "Erreur serveur transitoire. Vérifiez le travail déjà enregistré avant de réessayer." ;;
  esac
  [ -z "$emsg" ] && [ -n "$HTTP_BODY" ] && warn "Corps de réponse : $(head -c 2000 <<<"$HTTP_BODY")"
}

# Status transitoires pour lesquels une retry avec backoff est pertinente.
is_transient_status() {
  case "$1" in 429|500|503|000) return 0 ;; *) return 1 ;; esac
}

# --- Environnement de session ---------------------------------------------------
# Construit le JSON `environment` selon ENVIRONMENT_TYPE.
# Choix retenu : openai_hosted (sandbox Linux géré par OpenAI : runtime et
# provisioning fournis par OpenAI, aucun executor local à installer).
build_environment_json() {
  case "${ENVIRONMENT_TYPE:-openai_hosted}" in
    none)
      printf '{"type":"none"}\n'
      ;;
    openai_hosted)
      jq -n --arg cs "${CONTAINER_SIZE:-small}" --arg net "${NETWORK_ACCESS:-enabled}" \
        '{type:"openai_hosted", container_size:$cs, network:{access:$net}}'
      ;;
    self_hosted)
      die "self_hosted nécessite un executor en cours d'exécution sur votre machine (voir README, section Environnements). Utilisez openai_hosted ou none ici." 4
      ;;
    *)
      die "ENVIRONMENT_TYPE inconnu : '$ENVIRONMENT_TYPE' (valeurs admises : none, openai_hosted, self_hosted)." 4
      ;;
  esac
}

# Construit le payload de création de session :
#   - agent_id        : réutilise l'agent sauvegardé "Codex"
#   - agent           : overrides de session (modèle, instructions, raisonnement,
#                       texte, outils, multi_agent) — les autres réglages sauvegardés
#                       sont conservés par l'API
#   - environment     : environnement d'exécution choisi
#   - input           : message utilisateur initial
#   - stream          : true pour recevoir les événements du premier turn
build_create_payload() {
  local input_text="$1" payload_file="$2"
  local env_json override_json
  env_json="$(build_environment_json)" || return 1
  override_json="$(cat "$APP_DIR/agent_override.json")" \
    || die "Impossible de lire $APP_DIR/agent_override.json" 4
  jq -n \
    --arg agent_id "$AGENT_ID" \
    --argjson agent_override "$override_json" \
    --argjson environment "$env_json" \
    --arg input "$input_text" \
    '{
      agent_id: $agent_id,
      agent: $agent_override,
      environment: $environment,
      input: [
        { role: "user", content: [ { type: "input_text", text: $input } ] }
      ],
      stream: true
    }' > "$payload_file" || die "Échec de construction du payload JSON." 4
}

# --- Consommation du flux SSE ----------------------------------------------------
# Lit un flux SSE (Server-Sent Events) sur stdin, reconstitue chaque message
# (lignes data:...) et appelle le gestionnaire passé en argument avec le JSON.
# Codes de retour du gestionnaire :
#   0  = continuer ; autres codes = condition terminale propagée à l'appelant.
consume_sse_stream() {
  local handler="$1"
  local line data_buf="" rc seen_event=0
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    if [ -z "$line" ]; then
      if [ -n "$data_buf" ]; then
        seen_event=1
        "$handler" "$data_buf"
        rc=$?
        data_buf=""
        [ $rc -ne 0 ] && return $rc
      fi
      continue
    fi
    case "$line" in
      ":"*) ;; # commentaire / keep-alive SSE
      event:*) ;; # le type est inclus dans le JSON (champ .type)
      data:*)
        local chunk="${line#data:}"
        chunk="${chunk# }"
        if [ -n "$data_buf" ]; then data_buf+=$'\n'"$chunk"; else data_buf="$chunk"; fi
        ;;
    esac
  done
  if [ -n "$data_buf" ]; then
    seen_event=1
    "$handler" "$data_buf"
    rc=$?
    [ $rc -ne 0 ] && return $rc
  fi
  # Aucun événement reçu : le flux s'est fermé avant la fin du turn
  # (erreur HTTP ou coupure réseau).
  [ $seen_event -eq 0 ] && return 50
  return 0
}

# --- Gestion des événements de session --------------------------------------------
# Variables d'état alimentées par le gestionnaire :
SESSION_ID=""
TURN_ID=""

fetch_and_show_required_actions() {
  local sid="$1"
  [ -z "$sid" ] && return 0
  if http_request GET "/agents/sessions/$sid"; then
    if [ "${HTTP_STATUS:0:1}" = "2" ]; then
      warn "required_actions : $(jq -c '.required_actions // []' <<<"$HTTP_BODY")"
      info "Pour répondre, envoyez un événement avec : $APP_DIR/send-event.sh $sid <fichier-evenements.json>"
    else
      report_http_error "Récupération des required_actions impossible"
    fi
  fi
}

# Traite un événement JSON du flux de session.
# Codes de retour : 0 continuer | 40 turn terminé | 41 turn échoué |
#   42 turn annulé | 43 action requise | 44 échec session/environnement |
#   45 événement error | 46 item invalide
handle_session_event() {
  local json="$1"
  local etype
  etype="$(jq -r '.type // empty' <<<"$json" 2>/dev/null)" || return 0
  [ -z "$etype" ] && return 0

  if [ "${EVENTS_LOG:-1}" = "1" ]; then
    mkdir -p "$OUTPUT_DIR"
    printf '%s\n' "$json" >> "$EVENTS_LOG_FILE"
  fi

  case "$etype" in
    agent.session.created)
      SESSION_ID="$(jq -r '.session.id // empty' <<<"$json")"
      if [ -n "$SESSION_ID" ]; then
        mkdir -p "$OUTPUT_DIR"
        printf '%s' "$SESSION_ID" > "$SESSION_ID_FILE"
        info "Session créée : ${C_BOLD}$SESSION_ID${C_RESET} (agent « ${AGENT_NAME:-$AGENT_ID} »)"
      fi
      local sstatus
      sstatus="$(jq -r '.session.status // empty' <<<"$json")"
      [ -n "$sstatus" ] && info "Statut de la session : $sstatus"
      ;;

    agent.session.environment.ready)
      ok "Environnement prêt — id $(jq -r '.environment.id // "?"' <<<"$json"), statut $(jq -r '.environment.status // "?"' <<<"$json")"
      ;;

    agent.session.environment.reset)
      warn "Le sandbox a été remplacé (reset #$(jq -r '.reset_count // "?"' <<<"$json")) : l'historique de conversation est conservé, pas les fichiers du sandbox précédent."
      ;;

    agent.session.turn.started)
      TURN_ID="$(jq -r '.turn_id // empty' <<<"$json")"
      printf '\n' >&2
      info "— Turn démarré${TURN_ID:+ ($TURN_ID)} —"
      ;;

    agent.session.item.created)
      # Suivi des outils et éléments produits pendant le turn.
      local itype istatus
      itype="$(jq -r '.item.type // empty' <<<"$json")"
      istatus="$(jq -r '.item.status // empty' <<<"$json")"
      case "$itype" in
        web_search_call)
          info "🔎 Appel outil web_search${istatus:+ — statut: $istatus} — $(jq -c '.item | {action: (.action // .query // empty), status: (.status // empty)}' <<<"$json")"
          ;;
        function_call)
          warn "🛠  Appel de fonction : $(jq -r '.item.name // "?"' <<<"$json") $(jq -c '.item.arguments // {}' <<<"$json")"
          ;;
        command_execution)
          info "💻 Exécution de commande${istatus:+ — statut: $istatus} : $(jq -r '.item.command_line // .item.command // empty' <<<"$json")"
          ;;
        reasoning)
          [ "${VERBOSE_EVENTS:-0}" = "1" ] && info "Raisonnement (résumé) produit."
          ;;
        message)
          [ "${VERBOSE_EVENTS:-0}" = "1" ] && info "Nouvel élément message."
          ;;
        *)
          [ -n "$itype" ] && info "Élément créé : $itype${istatus:+ — statut: $istatus}"
          ;;
      esac
      ;;

    agent.output.command_execution_output.delta)
      printf '%s%s%s' "$C_DIM" "$(jq -r '.delta // empty' <<<"$json")" "$C_RESET"
      ;;

    agent.session.turn.output_text.delta)
      # Sortie texte du modèle : affichée en continu.
      jq -rj '.delta // empty' <<<"$json"
      ;;

    agent.session.turn.output_text.done)
      printf '\n'
      local done_text
      done_text="$(jq -r '.text // empty' <<<"$json")"
      {
        printf '\n'
        printf '%s\n' "$done_text"
      } >> "$FINAL_OUTPUT_FILE"
      ;;

    agent.session.requires_action)
      warn "La session demande une action externe (agent.session.requires_action)."
      fetch_and_show_required_actions "${SESSION_ID:-}"
      return 43
      ;;

    agent.session.idle)
      info "Session idle : aucun turn actif."
      ;;

    agent.session.turn.completed)
      local sub
      sub="$(jq -r '.turn.subagent_id // empty' <<<"$json")"
      if [ -z "$sub" ] || [ "$sub" = "null" ]; then
        printf '\n' >&2
        ok "Turn terminé avec succès."
        return 40
      fi
      info "Turn d'un sous-agent terminé ($sub)."
      ;;

    agent.session.turn.failed)
      local sub emsg
      sub="$(jq -r '.turn.subagent_id // empty' <<<"$json")"
      emsg="$(jq -r '.turn.error.message // empty' <<<"$json")"
      if [ -z "$sub" ] || [ "$sub" = "null" ]; then
        printf '\n' >&2
        warn "Turn échoué : ${emsg:-raison non précisée}"
        info "Détail possible via : $APP_DIR/session-info.sh <session_id>"
        return 41
      fi
      warn "Turn d'un sous-agent échoué ($sub) : ${emsg:-raison non précisée}"
      ;;

    agent.session.turn.cancelled)
      local sub
      sub="$(jq -r '.turn.subagent_id // empty' <<<"$json")"
      if [ -z "$sub" ] || [ "$sub" = "null" ]; then
        printf '\n' >&2
        warn "Turn annulé."
        return 42
      fi
      warn "Turn d'un sous-agent annulé ($sub)."
      ;;

    agent.session.failed)
      warn "Échec de la session : $(jq -r '.session.error // .error // empty' <<<"$json")"
      return 44
      ;;

    agent.session.environment.failed)
      warn "Échec de l'environnement : $(jq -r '.environment.error // empty' <<<"$json")"
      return 44
      ;;

    error)
      warn "Événement d'erreur reçu : $(jq -c '.error // .' <<<"$json")"
      return 45
      ;;

    *)
      [ "${VERBOSE_EVENTS:-0}" = "1" ] && info "Événement : $etype"
      ;;
  esac
  return 0
}

# Traduit le code de retour du flux en message + code de sortie du script.
explain_stream_rc() {
  local rc="$1"
  case "$rc" in
    0|40) return 0 ;;
    41) die "Le turn a échoué. Consultez output/events.jsonl et session-info.sh pour le détail." 11 ;;
    42) die "Le turn a été annulé." 12 ;;
    43) die "Action requise de votre part (required_actions) — voir messages ci-dessus." 13 ;;
    44) die "Échec de la session ou de son environnement." 14 ;;
    45) die "Un événement d'erreur a été reçu dans le flux." 15 ;;
    50) return 50 ;; # flux fermé sans événement : géré par l'appelant
    *)  die "Le flux s'est terminé avant la fin du turn (code interne $rc). Récupérez l'état sauvegardé (items) avant de réessayer." 16 ;;
  esac
}

# Affiche le rappel des artefacts produits.
print_artifacts_summary() {
  info "Artefacts produits :"
  [ -s "$SESSION_ID_FILE" ]  && info "  - ID de session      : $(cat "$SESSION_ID_FILE")  ($SESSION_ID_FILE)"
  [ -s "$FINAL_OUTPUT_FILE" ] && info "  - Sortie finale      : $FINAL_OUTPUT_FILE"
  [ "${EVENTS_LOG:-1}" = "1" ] && info "  - Journal d'événements : $EVENTS_LOG_FILE"
}
