# 🍥 Académie Ninja — apprendre en jouant (Maths & Français)

Jeu éducatif francophone **complet et multijoueur** : l’élève gagne des **Ryos** (monnaie fictive) en réussissant des quiz, monte
les **15 grades ninja** (Aspirant → Hokage Éternel), passe l’**Examen Hokage** (20 questions /20), défie ses amis en **duel classé
(ELO)**, joue à **6 jeux à 4 joueurs en ligne**, anime un **Kahoot** avec un PIN, débloque des **badges**, tourne la **machine à
sous** et crée ses propres jeux avec le **mode Créateur** (5 000 Ryos).

---

## ✨ Fonctionnalités

### Progression et récompenses
- **Ryos** : 10 par bonne réponse (×1,5 en moyen, ×2 en difficile), 15 à l’Examen Hokage, bonus de série, bonus de badges.
- **15 grades** : Aspirant, Élève Ninja, Genin, Genin Confirmé, Chunin, Chunin d’Élite, Jonin, Jonin de Classe S, ANBU, Sannin
  Légendaire, Kage, Kage Suprême, Sage des Six Chemins, Hokage, Hokage Éternel — chacun donne un bonus de gain (jusqu’à +30 %).
- **Badges** : 38 trophées (séries de réponses, examens parfaits, jackpots, victoires en ligne, séries de connexion…) avec récompense en Ryos.
- **Défis quotidiens** : 4 défis tirés chaque jour + un **Défi du jour** (6 questions, Ryos ×2) + le **Défi éclair
  ⚡ (10 questions en 10 secondes, Ryos ×2)** pour travailler les automatismes.
- **Série de connexion (streak)**, statistiques détaillées et **historique des parties** avec le détail des scores.
- **Sauvegarde automatique** : d’abord dans le navigateur (localStorage), puis synchronisée avec le serveur en ligne.

### Personnalisation
- Prénom/pseudo, **20 avatars** (boutique), **5 thèmes**, choix de la **difficulté** (facile / moyen / difficile) et de la
  **classe** : Maternelle (MS, GS), Élémentaire (CP → CM2), Collège (6ème → 3ème).
- **Mode de réponse « QCM ou autre »** (réglable dans le profil et dans l’Entraînement) :
  - 🔘 **QCM** : 4 choix à cliquer ;
  - 🎲 **Mixte** : QCM + **Vrai/Faux** + **réponses à écrire au clavier** ;
  - ⌨️ **Réponses écrites** : l’élève tape sa réponse (comparaison tolérante : accents, majuscules, virgule/point, articles…).

### Modules de révision
- **🖨️ Feuille de révision à imprimer** (espace parent / enseignant) : on choisit la matière, la classe (MS → 3ème), la
  difficulté, **10, 20 ou 30 questions** et le format (QCM ou réponses à écrire). La feuille s'imprime avec une page
  d'exercices et **le corrigé en page 2**.
- **📕 Cahier d'erreurs** : chaque question ratée (quiz, examen, défi) est automatiquement rangée dans le cahier. On la
  rejoue (série de 10, 15 Ryos par bonne réponse) : **deux révisions réussies** et la notion sort du cahier ; une
  nouvelle erreur la remet en révision. Répartition par matière et correction d'un clic.
- **Mathématiques** : banque de questions générée à l’infini pour les 11 niveaux (numération, calcul, fractions, proportionnalité,
  Pythagore, équations, Thalès…).
- **Français** : orthographe, conjugaison (générateur de conjugaison), homophones, grammaire, vocabulaire, figures de style.
- **Histoire-Géo, Sciences, Anglais** : banques de questions par cycle (~40 questions par matière).
- Un enfant de **MS/GS dispose désormais de 32 questions de français** (au lieu de 10) et chaque matière « culture »
  permet des séries de 30 questions uniques.
- **Examen Hokage** : 20 questions mélangées, note sur 20, verdict et correction complète — il suit aussi le mode de réponse
  choisi (QCM, mixte ou écrit).

### Multijoueur en ligne (serveur Socket.IO inclus)
- **Duels classés** : 1v1 sur 8 questions, ELO (≈ ±10-16 points), 5 ligues.
- **9 jeux multijoueurs** : 🎲 Plateau Ninja (dé + 30 cases), 🥋 Duel de Kunai (pierre-feuille-ciseaux + quiz), 👹 Combat de
  Boss (coopératif), ❌ Morpion Ninja, 🎱 Loto des Ryos, 💨 Course des Ninjas, 🛡️ **Bataille d’Équipes 2 vs 2** (avec mort
  subite), 🌊 **Bataille du Pays des Vagues** (bataille navale 1 contre 1 : une bonne réponse = un tir, +10 ELO) et 🧠
  **Memory des Ninjas** (12 cartes : associe chaque question à sa réponse).
- **Kahoot** : l’hôte génère un **PIN à 6 caractères**, chacun répond sur son appareil avec les grandes tuiles colorées et le
  classement en direct.
- **Amis** : barre de recherche de joueurs, demandes d’ami, messagerie privée, liste des **joueurs en ligne en temps réel**.
- **Classement mondial** : Ryos, ELO, séries, duels gagnés + position personnelle.
- **Hors ligne garanti** : sans serveur, tous les jeux fonctionnent contre des bots et le classement utilise des profils de référence.

### Mode Créateur 🛠️
- Débloqué à partir de **5 000 Ryos** (déduits à la publication).
- Atelier complet : titre, matière, classes visées, difficulté, questions (4 réponses + explication obligatoire).
- Publication dans la galerie communautaire (recherche, likes, compteur de parties) et jeu immédiat.

### Arcade 🎰
- Machine à sous (50 Ryos le tirage, jackpot 1 000), pari de dés (pair/impair ×2, un 6 ×6) et roue des Ryos quotidienne.

---

## 🚀 Lancer le projet

```bash
npm install

# 1) Serveur temps réel (API + Socket.IO + sert le site construit) — port 3001
npm run server

# 2) Interface en développement (proxy /api et /socket.io vers 3001) — port 5173
npm run dev
```

- **Site + jeu en ligne** : http://localhost:3001 (le serveur sert `dist/`)
- **Développement avec rechargement à chaud** : http://localhost:5173

Pour la production / une preview :

```bash
npm run build      # vérifie TypeScript puis construit dist/
npm run server     # sert dist/ + l’API + le multijoueur
```

> Astuce : pour jouer en ligne avec plusieurs personnes, il suffit qu’elles ouvrent la même adresse que l’hôte (réseau local ou
> URL publique de preview). Le serveur gère la présence, les salons et les codes de partie.

---

## 🗂️ Structure

```
shared/partyEngine.{js,d.ts}   Moteur des 9 jeux à plusieurs (utilisé par le serveur ET le navigateur, bot inclus)
shared/seedData.{js,d.ts}      Joueurs/jeux de référence (classement et repli hors ligne)
server/index.js                Express + Socket.IO : présence, amis, duels, salons, Kahoot, classement, jeux communautaires
src/data/questions/            Banques de questions (maths générées, français, histoire-géo, sciences, anglais)
src/data/                      Grades scolaires, grades ninja, badges, défis, jeux à 4, prix
src/hooks/                     useQuizSession (session de quiz), usePartyRoom (salon en ligne ou bots)
src/components/                Interface (Layout, QuestionCard, QuizRunner, plateau, dé, loto, morpion, boss…)
src/pages/                     Onboarding, Accueil, Quiz, Examen, Jeux à 4, Duels, Kahoot, Arcade, Défis, Badges, Grades,
                               Classement, Amis, Mode créateur, Profil
```

### Contrats utiles
- **Moteur de jeu** : `createGameState(gameId, players, { questions, maxRounds })` puis `reduce(state, action)` avec
  `action = { type: 'roll' | 'answer' | 'pick', playerId, choice?, pick?, payload? }`. Les bots jouent via `botAction(state, skill)`
  et les gains via `computeRewards(state, playerId)` / `ranking(state)`.
- **Socket.IO** : `hello`, `presence:list`, `presence:update`, `friends:request|accept|list`, `chat:send`, `duel:invite|accept|cancel`,
  `room:create|join|start|action|forceNext|leave|addBot|chat`, `rooms:list`.
- **REST** : `/api/health`, `/api/stats`, `/api/leaderboard`, `/api/users`, `/api/users/sync`, `/api/games` (+ like/play),
  `/api/matches`, `/api/friends/*`.

---

## 🧪 Vérifications automatiques

```bash
npm run check:questions   # vérifie 6 500+ questions sur les 3 modes de réponse (QCM, vrai/faux, saisie) + tolérance de saisie
npm run test:engine       # simule une partie complète des 9 jeux à plusieurs (bots) : tous doivent se terminer
npm run check:badges      # vérifie que les 50 badges sont tous atteignables et aucun acquis au démarrage
npm run check:sheets      # vérifie les feuilles imprimables (11 niveaux × 3 difficultés × 6 matières × 10/20/30 questions)
npm run check:errors      # vérifie la logique du cahier d'erreurs (ajout, rechute, maîtrise, limites)
npm run typecheck         # TypeScript strict
```

---

## 🔎 Référencement (Google)

- `index.html` contient les balises SEO, Open Graph et les données structurées **Schema.org WebApplication** (nom, description,
  public visé, liste de fonctionnalités).
- `public/robots.txt` et `public/sitemap.xml` sont fournis, ainsi qu’un `manifest.webmanifest` (installation sur mobile).

Pour apparaître dans Google :

1. **Remplace le domaine** `https://academie-ninja.fr` dans `public/sitemap.xml` (et l’URL `sitemap` de `public/robots.txt`) par
   l’adresse réelle de ton site.
2. Va sur [Google Search Console](https://search.google.com/search-console), connecte ton domaine par **préfixe d’URL**.
3. **Vérifie la propriété** avec la balise HTML : copie la balise `<meta name="google-site-verification" content="…" />` fournie
   par Google juste avant `</head>` dans `index.html`, puis relance un déploiement.
   *(Le fichier HTML de vérification fourni par Google fonctionne aussi s’il est placé dans `public/`.)*
4. Dans Search Console → **Sitemaps**, soumets `sitemap.xml`.
5. Utilise **Inspection de l’URL** → « Demander une indexation » pour la page d’accueil.

---

## 🎯 Public et pédagogie

- Interface pensée pour les enfants (gros boutons, emojis, animations) et pour les parents (espace explicatif, historique,
  mode créateur pour préparer des questions).
- Aucune donnée personnelle sensible : un prénom ou un pseudo suffit.
- Correction immédiate et explication de chaque réponse en cas d’erreur.

Bonne révision, et deviens Hokage ! 🔥
