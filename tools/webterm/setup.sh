#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# setup.sh — installe les fichiers statiques de xterm.js (vendor/) utilisés
# par tools/webterm/server.py. Dossier vendor/ ignoré par Git.
#
# Usage : ./tools/webterm/setup.sh
# ---------------------------------------------------------------------------
set -euo pipefail

XTERM_VERSION="${XTERM_VERSION:-6.0.0}"
FIT_VERSION="${FIT_VERSION:-0.11.0}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

npm install --prefix "$DIR/vendor" --no-audit --no-fund --save-exact \
  "@xterm/xterm@${XTERM_VERSION}" "@xterm/addon-fit@${FIT_VERSION}"

echo "OK : fichiers installés dans $DIR/vendor/node_modules/@xterm"
