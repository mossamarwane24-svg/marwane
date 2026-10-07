# Codex dans Arena, depuis une tablette

Mise en place du 2026-10-07 : Codex CLI est installe dans le sandbox Arena de ce repo,
plus un terminal accessible depuis le navigateur de la tablette.

## Ce qui est en place

- `codex` **0.160.1** (npm global) : `/usr/local/bin/codex`, binaire Rust `linux-x86_64`.
- `~/.codex/config.toml` : `approval_policy = "never"`, `sandbox_mode = "workspace-write"`,
  repo en `trust_level = "trusted"` (sinon le TUI demande une confirmation au demarrage).
- `cx` : raccourci vers `codex exec` dans `/home/user/marwane` (`cx -r` = lecture seule,
  `CX_TIMEOUT=60` pour borner la durée).
- Terminal web (xterm.js + vrai PTY) servi sur le port `8420` du sandbox, ouvert dans l'aperçu
  Arena. Le code de l'outil est hors repo, dans `/home/user/webterm` (README sur place).

## Utilisation depuis la tablette

Ouvrir l'aperçu « Terminal tablette » (port 8420) dans le navigateur de la tablette :

- barre de touches tactiles : `esc`, `tab`, `^C`, `^D`, `↑`, `↓`, `|`, `~`, `/`, `clear` ;
- champ de commande en bas (Entrée = exécuter, `↑`/`↓` = historique, `#clear` vide l'écran) ;
- bouton **▶ Codex** : tape la tâche en texte libre, ça lance `cx '<tâche>'` dans le terminal ;
- `A−` / `A+` pour la taille du texte, `⛶` plein écran, `↻` nouvelle session.

Commandes utiles :

```bash
codex --version
codex doctor              # installation, auth, réseau
codex login status
cx -r "explique ce que fait ce dépôt"
```

## Le blocage : le réseau sortant du sandbox

Le sandbox n'autorise que `github.com`, `codeload.github.com`, `api.github.com`,
`registry.npmjs.org`, `pypi.org`, `files.pythonhosted.org`. Les extrémités de Codex sont
filtrées (TLS haché court) :

```
✗ auth          no Codex credentials were found
⚠ websocket     tls handshake eof   (wss://api.openai.com/v1/responses)
✗ reachability  https://chatgpt.com/backend-api/…  TLS handshake failed (required)
```

Donc **le CLI est installé et opérationnel, mais il ne peut pas joindre le modèle** ici :
`codex exec` tourne en boucle `ERROR: Reconnecting... waiting for network`, et `codex login`
ne peut pas ouvrir le flux OAuth (ni le navigateur, ni `chatgpt.com`).

Pour l'ajouter au terminal, saisir la clé dans le terminal (jamais dans le chat) :

```bash
read -rs KEY
printf '%s' "$KEY" | codex login --with-api-key
unset KEY
```

Trois façons de rendre Codex utilisable :

1. élargir le réseau sortant du sandbox à `api.openai.com` (ou `chatgpt.com`) ;
2. configurer un fournisseur compatible joignable depuis le sandbox :

   ```toml
   # ~/.codex/config.toml
   model_provider = "relais"
   [model_providers.relais]
   name = "relais openai-compatible"
   base_url = "https://<hote-autorise>/v1"
   env_key = "RELAY_API_KEY"
   wire_api = "responses"   # ou "chat"
   ```

3. un modèle local (`codex exec --oss --local-provider ollama`) : à écarter ici, aucun hub de
   modèles n'est téléchargeable et le sandbox fait 2 cœurs / 4 Go.

Sans l'une de ces trois options, la même besogne se fait par le mode agent d'Arena (lecture et
écriture du repo, commandes, git, PR) depuis cette interface, y compris sur tablette.
