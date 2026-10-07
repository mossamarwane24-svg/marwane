# marwane

## Application « Codex » — Agents API d'OpenAI (curl + bash)

Application exécutable qui démarre une **session** avec l'[Agents API d'OpenAI](https://developers.openai.com/api/docs/guides/agents-api/overview),
réutilise l'**agent sauvegardé « Codex »**, applique les **overrides de session**
en cours (modèle, instructions, raisonnement, texte, outils), envoie un **message
utilisateur initial**, puis **stream la sortie et les événements** avec gestion
des erreurs et des appels d'outils.

Tous les appels sont faits **directement en shell avec `curl`** (aucun SDK requis),
conformément à la documentation actuelle :
<https://developers.openai.com/api/docs/guides/agents-api/overview>

---

## Configuration retenue

| Élément | Valeur |
| --- | --- |
| Agent sauvegardé | `agent_d3de695fc03b431abcf769c6a4d9df79b404fcd2105f4d63a8` (nom : **Codex**) |
| Projet OpenAI | `proj_vcoDGEaHb1xRyOq9aBL2ZA7c` (en-tête `OpenAI-Project`) |
| Modèle (override) | `gpt-6-astra` |
| Raisonnement (override) | `effort: max`, `summary: auto` |
| Texte (override) | format `text`, `verbosity: high` |
| Outils (override) | `web_search` (`mode: live`, `context_size: medium`) |
| Multi-agent (override) | désactivé |
| Environnement | **`openai_hosted`** — sandbox Linux géré par OpenAI (voir ci-dessous) |

Les overrides sont envoyés via le champ `agent` **en plus** de `agent_id` lors de
la création de session : l'API copie les réglages sauvegardés non fournis et
applique les nôtres par-dessus — l'agent sauvegardé n'est **pas** modifié.
Référence : [Override settings for one session](https://developers.openai.com/api/docs/guides/agents-api/configuration#override-settings-for-one-session).

### Choix de l'environnement

Trois types sont supportés : `none`, `openai_hosted`, `self_hosted`.

- ✅ **`openai_hosted` (retenu)** : OpenAI provisionne le runtime et le sandbox
  (Linux, `/workspace`, Python/Node). **Aucun executor ni runtime à installer
  localement** — c'est l'environnement adapté à une application pilotée en pur
  shell. Taille du conteneur et réseau sont configurables
  (`CONTAINER_SIZE`, `NETWORK_ACCESS` dans `codex-agent/config.env`).
  Facturé au tarif conteneur + tokens du modèle.
- `none` : pas d'environnement d'exécution (tâche purement texte, moins coûteux).
  Activable avec `ENVIRONMENT_TYPE=none ./codex-agent/run.sh`.
- `self_hosted` : nécessiterait un **executor** tournant sur votre machine
  ([documentation](https://developers.openai.com/api/docs/guides/agents-api/environments/self-hosted)) ;
  volontairement non activé ici.

---

## Prérequis

- `bash` ≥ 4, `curl` récent (≥ 7.76 conseillé) et `jq` :
  ```bash
  sudo apt-get install curl jq   # Debian/Ubuntu
  brew install curl jq           # macOS
  ```
- Une **clé API d'application** du projet OpenAI ci-dessus, avec les portées :
  `api.agents.read`, `api.agents.write` et `api.responses.write`
  ([créer une clé](https://platform.openai.com/api-keys)).

## Installation

```bash
git clone <ce dépôt> && cd marwane
export OPENAI_API_KEY="sk-..."        # clé du projet proj_vcoDGEaHb1xRyOq9aBL2ZA7c
chmod +x codex-agent/*.sh             # déjà fait dans le dépôt normalement
```

> ⚠️ Gardez `OPENAI_API_KEY` hors du sandbox de l'agent (elle n'est jamais
> envoyée dans la requête `environment.env`).

## Exécution

1. **Lancer l'agent** (crée la session, envoie le message initial, stream la sortie) :

   ```bash
   ./codex-agent/run.sh
   # ou avec un message personnalisé :
   ./codex-agent/run.sh "Rédige la documentation complète prévue dans tes instructions."
   ```

   La sortie texte s'affiche en continu ; les événements (création de session,
   environnement prêt, appels `web_search`, fin/échec de turn) sont journalisés.
   Artefacts écrits dans `output/` : `last_session_id`, `last_output.md`,
   `events.jsonl`.

2. **Continuer la conversation** (même session) :

   ```bash
   ./codex-agent/send-message.sh "$(cat output/last_session_id)" "Ajoute la section bonus 44."
   ```

3. **Suivre une session en cours** :

   ```bash
   ./codex-agent/stream-session.sh <session_id> [--until-idle]
   ```

4. **Récupérer le travail sauvegardé** (après coupure du flux par exemple) :

   ```bash
   ./codex-agent/session-info.sh <session_id>     # statut, erreurs, required_actions
   ./codex-agent/list-items.sh <session_id>       # messages + appels d'outils
   RAW=1 ./codex-agent/list-items.sh <session_id> # JSON brut
   ```

5. **Répondre à une action requise / annuler** (gestion des appels d'outils) :

   ```bash
   # Si la session émet agent.session.requires_action (ex. function_call) :
   ./codex-agent/send-event.sh <session_id> reponse.json
   # Annuler le turn en cours :
   ./codex-agent/send-event.sh <session_id> --cancel
   ```

6. **Nettoyer** (supprime la session et demande le nettoyage du sandbox) :

   ```bash
   ./codex-agent/delete-session.sh <session_id>
   ```

### Test à vide (sans appeler l'API)

```bash
DRY_RUN=1 ./codex-agent/run.sh     # imprime la requête JSON complète
```

---

## Fonctionnement interne

```
run.sh ──POST /v1/agents/sessions (stream=true, Idempotency-Key)──▶ Agents API
        │   corps : agent_id + agent (overrides) + environment + input
        ▼
     flux SSE : agent.session.created → environment.ready → turn.started
                → item.created (🔎 web_search_call…)
                → turn.output_text.delta/done (texte affiché en direct)
                → turn.completed / turn.failed / requires_action…
```

- **Streaming** : le flux SSE est reconstitué ligne à ligne (`data:`…), chaque
  événement JSON est analysé avec `jq` (`lib/common.sh:handle_session_event`).
- **Erreurs HTTP** : code + `error.type/code/message/param` analysés avec
  diagnostic ciblé (401/403 clés, 404 agent/projet introuvable,
  400 `agent_not_persisted`, 409 conflits, 429 backoff, 5xx transitoires).
- **Retries** : création de session rejouée avec backoff exponentiel **et la même
  clé d'idempotence** (pas de doublon de session) sur 429/500/503/réseau.
- **Échecs de turn/session** : `turn.failed`, `turn.cancelled`, `session.failed`,
  `environment.failed` et `error` sont détectés, expliqués, et donnent un code de
  sortie non nul ; `agent.session.idle` seul n'est jamais traité comme un succès.
- **Coupure du flux** : suivre la procédure de récupération de la doc —
  `session-info.sh` puis `list-items.sh` (les items sauvegardés contiennent le
  travail accompli), puis `stream-session.sh` pour se réabonner.
- **Appels d'outils** : les items `web_search_call` et `command_execution` sont
  affichés pendant le turn ; un `requires_action` récupère et affiche les
  `required_actions` de la session et indique comment y répondre
  (`send-event.sh`, ex. `agent.session.input.function_call_output`).

## Structure du projet

```
codex-agent/
├── config.env           # projet, agent_id, environnement, délais, retries
├── agent_override.json  # overrides de session (modèle/instructions/raisonnement/texte/outils)
├── lib/common.sh        # helpers curl+SSE+événements partagés
├── run.sh               # créer la session + message initial + stream
├── send-message.sh      # message de suivi (abonne le flux avant l'envoi)
├── stream-session.sh    # abonnement au flux d'une session existante
├── list-items.sh        # items sauvegardés (messages, appels d'outils)
├── session-info.sh      # état de la session (statut, erreurs, actions requises)
├── send-event.sh        # événements bruts (réponses d'outils, annulation)
└── delete-session.sh    # suppression de session (retry sur 409)
output/                  # artefacts d'exécution (ignoré par git)
```

## Personnalisation

- Modifier les overrides : éditer `codex-agent/agent_override.json`
  (objets/array fournis remplacent intégralement le champ sauvegardé).
- Changer d'environnement : `ENVIRONMENT_TYPE=none|openai_hosted ./codex-agent/run.sh`,
  `CONTAINER_SIZE=small|medium|large`, `NETWORK_ACCESS=enabled|disabled|restricted`.
- Journal brut des événements : `EVENTS_LOG=0` pour désactiver ;
  `VERBOSE_EVENTS=1` pour afficher aussi les événements non gérés.

## Dépannage

| Symptôme | Piste |
| --- | --- |
| 401/403 | Clé manquante/invalide, ou portées manquantes (`api.agents.*`, `api.responses.write`). |
| 404 `model_not_found` / agent introuvable | L'agent sauvegardé ou le modèle n'est pas accessible depuis le projet `proj_vcoDGEaHb1xRyOq9aBL2ZA7c`. |
| 400 `agent_not_persisted` | L'`AGENT_ID` doit désigner un agent sauvegardé, pas un agent de session. |
| Flux coupé sans événement | Voir « Coupure du flux » ci-dessus ; le script retente automatiquement avec la même clé d'idempotence. |
| `requires_action` | Inspecter `session-info.sh` puis répondre via `send-event.sh`. |

Voir aussi : [Erreurs et récupération](https://developers.openai.com/api/docs/guides/agents-api/errors).
