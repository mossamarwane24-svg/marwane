import type { PartyGameId, PartyGameInfo } from '../types';

export const PARTY_GAMES: PartyGameInfo[] = [
  {
    id: 'plateau',
    name: 'Plateau Ninja',
    emoji: '🎲',
    tag: 'Le classique : dé, cases et questions',
    desc: 'Lance le dé, avance sur les 30 cases et affronte les défis pour arriver le premier.',
    minPlayers: 2,
    maxPlayers: 4,
    rules: [
      'Chaque joueur lance le dé à son tour et avance du nombre de cases.',
      'Case 📝 Défi : réponds juste pour avancer de 2 cases bonus et gagner des Ryos.',
      'Case 💰 Trésor : +50 Ryos. Case ⚡ Bonus : +80 Ryos et tu rejoues.',
      'Case 🕳️ Piège : tu recules de 3 cases. Case 🔄 Échange : tu échanges ta place avec le leader.',
      'Le premier à atteindre la case 30 (🏁) gagne la partie !'
    ]
  },
  {
    id: 'kunai',
    name: 'Duel de Kunai',
    emoji: '🥋',
    tag: 'Pierre-feuille-ciseaux + quiz',
    desc: 'Choisis ton arme, réponds juste : chaque adversaire battu te rapporte un point.',
    minPlayers: 2,
    maxPlayers: 4,
    rules: [
      'Chaque manche, tout le monde choisit pierre, feuille ou ciseaux.',
      'Puis tout le monde répond à la même question.',
      'Tu marques 1 point par adversaire que ton arme bat (pierre bat ciseaux, etc.).',
      'Une bonne réponse rapporte 1 point bonus.',
      'Après 5 manches, le meilleur score gagne.'
    ]
  },
  {
    id: 'boss',
    name: 'Combat de Boss',
    emoji: '👹',
    tag: 'Coopération : 4 ninjas contre le Démon Renard',
    desc: 'Unissez vos réponses pour vider la barre de vie du boss avant qu’il ne vous mette K.O.',
    minPlayers: 1,
    maxPlayers: 4,
    rules: [
      'Le boss a de la vie (100 PV + 25 par joueur supplémentaire).',
      'Chaque bonne réponse inflige 10 dégâts (plus si tu enchaînes les bonnes réponses).',
      'Chaque erreur vous coûte 12 PV : vous avez 30 PV chacun.',
      'Vous gagnez ensemble si le boss tombe avant vous.',
      'Bonus de Ryos pour tout le groupe en cas de victoire.'
    ]
  },
  {
    id: 'morpion',
    name: 'Morpion Ninja',
    emoji: '❌',
    tag: 'Aligne 3 symboles… en répondant juste',
    desc: 'Pour poser ton symbole, tu dois d’abord répondre correctement à la question.',
    minPlayers: 2,
    maxPlayers: 4,
    rules: [
      'Chacun son tour, une question est posée au joueur actif.',
      'Bonne réponse : tu poses ton symbole où tu veux sur la grille.',
      'Mauvaise réponse : tu passes ton tour, quelle frustration !',
      'Aligne 3 symboles (ligne, colonne, diagonale) pour gagner.',
      'Si la grille est pleine, c’est match nul.'
    ]
  },
  {
    id: 'loto',
    name: 'Loto des Ryos',
    emoji: '🎱',
    tag: 'Bingo ninja : coche tes numéros',
    desc: 'Réponds juste pour tirer un numéro et compléter une ligne de ta carte.',
    minPlayers: 2,
    maxPlayers: 4,
    rules: [
      'Chaque joueur reçoit une carte de 9 numéros (entre 1 et 30).',
      'Au tour de jeu, une bonne réponse te fait tirer un numéro.',
      'Si le numéro est sur ta carte, tu le coches : +20 Ryos au passage.',
      'Le premier à cocher une ligne entière gagne la partie.',
      'Sinon, celui qui a le plus de numéros cochés l’emporte.'
    ]
  },
  {
    id: 'memory',
    name: 'Memory des Ninjas',
    emoji: '🧠',
    tag: 'Jusqu’à 4 joueurs',
    desc: 'Retourne les cartes pour associer chaque question à sa bonne réponse, puis réponds bien pour garder la paire.',
    minPlayers: 2,
    maxPlayers: 4,
    rules: [
      'À ton tour, retourne deux cartes du plateau (12 cartes = 6 paires).',
      'Si tu trouves une question et sa bonne réponse, une question t’est posée.',
      '✅ Bonne réponse : tu gardes la paire, +30 points et tu rejoues !',
      '❌ Mauvaise réponse ou cartes qui ne vont pas ensemble : elles se retournent, à l’autre joueur.',
      'Le plus grand nombre de points à la fin de la partie gagne.'
    ]
  },
  {
    id: 'puissance4',
    name: 'Puissance 4 des Ninjas',
    emoji: '🔴',
    tag: 'Jusqu’à 4 joueurs',
    desc: 'Aligne 4 jetons dans la grille : chaque bonne réponse te laisse choisir ta colonne, chaque erreur fait tomber ton jeton au hasard.',
    minPlayers: 2,
    maxPlayers: 4,
    rules: [
      'À ton tour, réponds à la question posée.',
      '✅ Bonne réponse : tu choisis la colonne où ton jeton tombe (+25 points).',
      '❌ Mauvaise réponse : ton jeton tombe dans une colonne au hasard.',
      'Chaque alignement de 3 jetons rapporte +15 points (il départage la fin de partie).',
      'Le premier qui aligne 4 jetons (ligne, colonne ou diagonale) gagne !',
      'Si la grille est pleine : pas de match nul, le meilleur total de points l’emporte.'
    ]
  },
  {
    id: 'bataille',
    name: 'Bataille du Pays des Vagues',
    emoji: '🌊',
    tag: 'En VS : 1 contre 1',
    desc: 'Chaque bonne réponse te donne droit à un tir de kunai : coule les 3 navires de ton adversaire avant lui.',
    minPlayers: 2,
    maxPlayers: 4,
    rules: [
      'Réponds correctement à la question pour gagner le droit de tirer.',
      'Clique ensuite sur une case de la flotte adverse pour lancer ton attaque.',
      '💥 Touché = +20 points · 🚢 Navire coulé = +50 points.',
      'Une erreur = aucun tir et c’est à l’adversaire de jouer.',
      'Le premier qui coule les 3 navires adverses gagne la bataille et +10 ELO.'
    ]
  },
  {
    id: 'equipe',
    name: 'Bataille d’Équipes (2 vs 2)',
    emoji: '🛡️',
    tag: 'En VS : équipe 1 contre équipe 2',
    desc: 'Les joueurs sont répartis en deux équipes : additionnez les bonnes réponses pour écraser l’équipe adverse.',
    minPlayers: 2,
    maxPlayers: 4,
    rules: [
      'Les joueurs sont répartis automatiquement en équipe 1 et équipe 2.',
      'La même question est posée à tout le monde en même temps.',
      'Le premier à répondre juste rapporte 3 points à son équipe, les autres bonnes réponses 2 points.',
      'Une erreur ne rapporte rien : discutez de la stratégie entre coéquipiers !',
      'Après 8 manches, l’équipe qui a le plus de points gagne — et en cas d’égalité, MORT SUBITE !'
    ]
  },
  {
    id: 'course',
    name: 'Course des Ninjas',
    emoji: '💨',
    tag: 'Tout le monde répond en même temps',
    desc: '10 questions en simultané : le plus rapide et le plus juste remporte la course.',
    minPlayers: 2,
    maxPlayers: 4,
    rules: [
      'La même question est posée à tout le monde en même temps.',
      'Le premier à répondre juste gagne 3 points, les autres 2 points.',
      'Une mauvaise réponse coûte 1 point.',
      '10 manches, chrono de 30 secondes par question.',
      'Le meilleur score devient Hokage de la course !'
    ]
  }
];

export const partyGameById = (id: PartyGameId): PartyGameInfo =>
  PARTY_GAMES.find((g) => g.id === id) || PARTY_GAMES[0];
