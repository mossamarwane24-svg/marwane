# Codex CLI : sandbox Arena et tablette

État au 2026-10-08.

## Ce qui est installé

- Codex CLI **officiel** : paquet npm `@openai/codex` (dépôt `openai/codex`, licence Apache-2.0), version **0.161.0**, dans `/usr/local/bin/codex`.
- Installation ou réinstallation : `./scripts/install-codex.sh` (idempotent).
- Configuration : `~/.codex/config.toml` avec `approval_policy = "never"`, `sandbox_mode = "workspace-write"` et le dépôt marqué `trusted`.

## Ce qui bloque

`codex doctor` donne aujourd'hui :

```
✗ auth          no Codex credentials were found
⚠ websocket     Responses WebSocket failed
✗ reachability  required provider endpoints are unreachable over HTTP
```

Le sandbox Arena n'ouvre le réseau sortant qu'à `github.com`, `codeload.github.com`, `api.github.com`, `registry.npmjs.org`, `pypi.org` et `files.pythonhosted.org`. Un `curl` vers `https://api.openai.com` ne reçoit aucune réponse (code 000).

**Conséquence : Codex est installé, mais il ne peut pas joindre le modèle depuis le sandbox.** Ce n'est pas un problème d'installation. Pour que Codex réponde dans Arena, la plateforme doit autoriser au minimum `api.openai.com` et `chatgpt.com` (ce que demande `codex doctor`). Ce réglage se fait côté Arena, pas dans ce dépôt.

## Connexion (une fois le réseau ouvert)

Ne jamais coller une clé dans le chat ni la committer.

- Compte ChatGPT : `codex login`, puis suivre le lien affiché.
- Clé API, saisie dans le terminal : `read -rs KEY && printf '%s' "$KEY" | codex login --with-api-key && unset KEY`

Vérification : `codex login status`, puis `codex doctor` (auth et reachability doivent être ✓), puis `codex exec "explique ce dépôt"`.

## Sur la tablette Android (sans passer par le sandbox)

La tablette a son propre accès à internet, elle peut donc faire tourner Codex directement, avec [Termux](https://termux.dev) :

```bash
pkg update && pkg install nodejs git
npm i -g @openai/codex@0.161.0
git clone https://github.com/mossamarwane24-svg/marwane.git && cd marwane
codex login
```

**Point non testé :** le lanceur de Codex gère bien Android, mais les paquets binaires (`@openai/codex-linux-arm64`, etc.) ne déclarent que `os: linux`. Npm peut donc les ignorer sur Android. Si l'installation échoue à l'étape `npm i -g`, c'est le point à signaler.

## Sur iPad

Codex CLI n'a pas de build pour iPadOS (le lanceur ne gère que Linux, Android, macOS et Windows). Sur iPad, le mode agent Arena dans le navigateur reste la solution : lecture et écriture du dépôt, commandes, git et PR.

## Sécurité

- Aucune clé ni aucun token dans le dépôt, dans les commits ou dans le chat.
- `approval_policy = "never"` : Codex exécute sans demander. Les écritures sont limitées au dossier du dépôt (`workspace-write`). À reconsidérer si d'autres personnes peuvent utiliser le terminal.
- Un terminal web ouvert dans l'aperçu Arena **sans mot de passe** donnerait un shell sur le sandbox, donc accès à l'authentification GitHub configurée dans le sandbox. Il faut une authentification avant toute exposition de ce type.
