#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# install-codex.sh — installe le Codex CLI officiel d'OpenAI (paquet npm
# @openai/codex, dépôt github.com/openai/codex) et écrit sa configuration.
#
# Usage :
#   ./scripts/install-codex.sh
#   CODEX_VERSION=0.161.0 ./scripts/install-codex.sh
#
# Idempotent : réinstalle seulement si la version présente diffère, et ne
# remplace jamais une configuration existante.
# Aucune clé ni aucun identifiant n'est écrit par ce script : la connexion
# reste une étape manuelle (voir docs/codex.md).
# ---------------------------------------------------------------------------
set -euo pipefail

CODEX_VERSION="${CODEX_VERSION:-0.161.0}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
CONFIG_FILE="$CODEX_HOME_DIR/config.toml"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm introuvable : installer Node.js (>= 16) d'abord." >&2
  exit 1
fi

current="$(codex --version 2>/dev/null | awk '{print $2}' || true)"
if [ "$current" != "$CODEX_VERSION" ]; then
  echo "Installation de @openai/codex@$CODEX_VERSION (version présente : ${current:-aucune})…"
  npm i -g "@openai/codex@$CODEX_VERSION" --no-audit --no-fund
else
  echo "Codex $CODEX_VERSION déjà installé."
fi

mkdir -p "$CODEX_HOME_DIR"
if [ ! -f "$CONFIG_FILE" ]; then
  cat > "$CONFIG_FILE" <<EOF
# Généré par scripts/install-codex.sh (modifiable à la main)
approval_policy = "never"
sandbox_mode = "workspace-write"

[projects."$REPO_DIR"]
trust_level = "trusted"
EOF
  echo "Configuration écrite : $CONFIG_FILE"
else
  echo "Configuration existante conservée : $CONFIG_FILE"
fi

codex --version
echo "Connexion : $(codex login status 2>&1 | head -n 1 || true)"
echo "Diagnostic réseau : codex doctor (Codex ne peut répondre que si auth et reachability sont ✓)."
