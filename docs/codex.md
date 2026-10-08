# Codex CLI et terminal tablette (Arena)

État au 2026-10-08.

## Ce qui est en place

- **Codex CLI officiel** : paquet npm `@openai/codex` (dépôt `openai/codex`, licence Apache-2.0), version **0.161.0**, dans `/usr/local/bin/codex`.
- **Configuration** : `~/.codex/config.toml` avec `approval_policy = "never"`, `sandbox_mode = "workspace-write"` et le dépôt marqué `trusted`.
- **Installation ou réinstallation** : `./scripts/install-codex.sh` (idempotent).
- **Terminal web pour la tablette** : `tools/webterm/`, lancé comme aperçu « Terminal tablette » sur le port 8420.

## Ce qui bloque Codex

`codex doctor` donne aujourd'hui :

```
✗ auth          no Codex credentials were found
⚠ websocket     Responses WebSocket failed
✗ reachability  required provider endpoints are unreachable over HTTP
```

Le sandbox Arena n'ouvre le réseau sortant qu'à `github.com`, `codeload.github.com`, `api.github.com`, `registry.npmjs.org`, `pypi.org` et `files.pythonhosted.org`. Un `curl` vers `https://api.openai.com` ne reçoit aucune réponse (code 000).

**Conséquence : le terminal fonctionne, Codex est installé, mais Codex ne peut pas joindre le modèle depuis le sandbox.** Pour que Codex réponde dans Arena, la plateforme doit autoriser au minimum `api.openai.com` et `chatgpt.com` (ce que demande `codex doctor`). Ce réglage se fait côté Arena, pas dans ce dépôt.

## Terminal web (tablette)

- Ouvrir l'aperçu « Terminal tablette » (port 8420) dans le navigateur de la tablette.
- Mot de passe : fichier `~/.config/webterm/password` (chmod 600, hors dépôt). Il est généré au premier lancement et n'est jamais écrit dans les journaux ni dans le chat.
- Lancer ou relancer le serveur : `python3 tools/webterm/server.py`. Installer xterm.js une fois avec `./tools/webterm/setup.sh`.
- Changer de mot de passe : supprimer le fichier, puis relancer le serveur.
- Barre de touches : esc, tab, ctrl (collant, pour la prochaine touche), ^C, ^D, flèches, `|`, `~`, `/`, entrée. Boutons A− / A+ (taille du texte), ↻ (nouvelle session quand le shell s'est fermé), Quitter (déconnexion).
- Sécurité :
  - Quiconque a le mot de passe obtient un shell dans le sandbox, donc accès à l'authentification GitHub configurée. Ne pas partager l'URL de l'aperçu.
  - Sessions de 12 h, cookie `HttpOnly; Secure; SameSite=Strict`, en-tête `X-Webterm` exigé pour les POST, délai de 1,5 s après un mauvais mot de passe.
- Vérifié au niveau de l'API : accès refusé sans mot de passe, refus sans en-tête CSRF, connexion, commandes exécutées, `codex --version` dans le terminal, redémarrage après `exit`, déconnexion.
- Non vérifié : l'interface dans un vrai navigateur et sur tablette (aucun navigateur headless dans le sandbox). À tester dès la première ouverture.

## Connexion à Codex (une fois le réseau ouvert)

Ne jamais coller une clé dans le chat ni la committer.

- Compte ChatGPT : `codex login`, puis suivre le lien affiché.
- Clé API, saisie dans le terminal : `read -rs KEY && printf '%s' "$KEY" | codex login --with-api-key && unset KEY`

Vérification : `codex login status`, puis `codex doctor` (auth et reachability doivent être ✓), puis `codex exec "explique ce dépôt"`.

## Tablette Android sans passer par le sandbox

La tablette a son propre accès à internet. Elle peut donc faire tourner Codex directement, avec [Termux](https://termux.dev) :

```bash
pkg update && pkg install nodejs git
npm i -g @openai/codex@0.161.0
git clone https://github.com/mossamarwane24-svg/marwane.git && cd marwane
codex login
```

**Point non testé :** le lanceur de Codex gère Android, mais les paquets binaires (`@openai/codex-linux-arm64`, etc.) ne déclarent que `os: linux`. Npm peut donc les ignorer sur Android. Si l'installation échoue à l'étape `npm i -g`, c'est le point à signaler.

## iPad

Codex CLI n'a pas de build pour iPadOS (le lanceur ne gère que Linux, Android, macOS et Windows). Sur iPad, le mode agent Arena dans le navigateur reste la solution : lecture et écriture du dépôt, commandes, git et PR.

## Sécurité (Codex)

- Aucune clé ni aucun token dans le dépôt, dans les commits ou dans le chat.
- `approval_policy = "never"` : Codex exécute sans demander de confirmation. Les écritures sont limitées au dossier du dépôt (`workspace-write`). À reconsidérer si d'autres personnes peuvent utiliser le terminal.
