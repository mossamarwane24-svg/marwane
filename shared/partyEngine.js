// ---------------------------------------------------------------------------
// Moteur des jeux a 4 joueurs (Plateau, Kunai, Boss, Morpion, Loto, Course).
// Ce fichier est utilise TEL QUEL par le serveur Node (mode en ligne) et par
// le navigateur (mode hors ligne avec des bots). Il ne contient aucune
// dependance : uniquement de la logique pure.
// ---------------------------------------------------------------------------

export const GAME_IDS = ['plateau', 'kunai', 'boss', 'morpion', 'loto', 'course', 'equipe', 'bataille', 'memory', 'puissance4'];

export const SQUARE_TYPES = ['quiz', 'quiz', 'quiz', 'ryos', 'trap', 'bonus', 'boss', 'swap', 'ryos', 'quiz'];

export const BOARD_SIZE = 30;

/** Grille du Puissance 4 : 7 colonnes x 6 lignes. */
export const P4_COLS = 6;
export const P4_ROWS = 5;

const rnd = (max) => Math.floor(Math.random() * max);
const rndRange = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cree la piste du plateau : une case de depart, un arrivee, des defis varies. */
export function makeBoard(size = BOARD_SIZE) {
  const squares = [{ index: 0, type: 'start' }];
  for (let i = 1; i < size - 1; i++) {
    squares.push({ index: i, type: SQUARE_TYPES[i % SQUARE_TYPES.length] });
  }
  squares.push({ index: size - 1, type: 'final' });
  return squares;
}

function makeCard() {
  const nums = shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, 9);
  return nums;
}

export function createGameState(gameId, players, options = {}) {
  const list = players.map((p, i) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar || '🦊',
    bot: !!p.bot,
    team: gameId === 'equipe' ? i % 2 : 0,
    ships: gameId === 'bataille' ? placeFleet() : [],
    /** Celles deja visees par l'adversaire : { [cell]: 'hit' | 'miss' } */
    incoming: {},
    pos: 0,
    score: 0,
    hp: 30,
    alive: true,
    correct: 0,
    wrong: 0,
    streak: 0,
    best: 0,
    finished: false,
    card: makeCard(),
    marks: [],
    pick: null,
    ready: false,
    answered: false,
    lastPoints: 0,
    /** Puissance 4 : alignements de 3+ deja comptes (departage en fin de grille). */
    lines3: 0
  }));

  const state = {
    gameId,
    players: list,
    turn: 0,
    round: 1,
    maxRounds: options.maxRounds || (gameId === 'course' ? 10 : gameId === 'kunai' ? 5 : gameId === 'boss' ? 8 : gameId === 'equipe' ? 8 : gameId === 'bataille' ? 24 : gameId === 'memory' ? 30 : gameId === 'puissance4' ? P4_COLS * P4_ROWS : 14),
    suddenDeath: 0,
    hardCap: 0,
    phase: 'lancer',
    question: null,
    questions: options.questions || [],
    qIndex: 0,
    board: gameId === 'plateau' ? makeBoard(options.boardSize || BOARD_SIZE) : [],
    /** Memory : 12 cartes (6 paires question/reponse) + proprietaire de chaque carte. */
    cards: gameId === 'memory' ? makeMemoryGrid(options.questions || []) : [],
    owners: gameId === 'memory' ? Array(12).fill(-1) : [],
    flipped: [],
    seen: [],
    /** Puissance 4 : les 4 cases gagnantes (mise en avant a la fin). */
    winLine: [],
    grid: gameId === 'morpion' ? Array(9).fill(null) : gameId === 'puissance4' ? Array(P4_COLS * P4_ROWS).fill(null) : [],
    drawn: [],
    pending: { dice: null, pick: null, bossHp: 100 + (list.length - 1) * 25, answers: {} },
    log: [],
    winners: [],
    over: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  state.hardCap = state.maxRounds + 9;
  if (gameId === 'bataille') pushLog(state, '🌊 Chaque bonne réponse donne droit à un tir : coule les 3 navires ennemis !');
  if (gameId === 'puissance4') pushLog(state, '\u{1F534} Alignez 4 jetons : une bonne r\u00e9ponse = tu choisis ta colonne, une erreur = le jeton tombe au hasard !');
  if (gameId === 'equipe') pushLog(state, 'Équipes : ' + list.filter((p) => p.team === 0).map((p) => p.name).join(' & ') + '  VS  ' + list.filter((p) => p.team === 1).map((p) => p.name).join(' & '));
  pushLog(state, `La partie commence avec ${list.length} ninjas !`);
  if (gameId === 'memory') {
    state.phase = 'pick';
    state.pending.pick = { playerId: list[0].id };
    pushLog(state, 'Retourne deux cartes : si la question et sa reponse correspondent, reponds bien pour gagner la paire !');
  } else if (gameId !== 'plateau') {
    state.phase = 'question';
    startQuestion(state, null);
  }
  return state;
}

function pushLog(state, text) {
  state.log = [{ at: Date.now(), text }, ...state.log].slice(0, 40);
}

function player(state, id) {
  return state.players.find((p) => p.id === id);
}

function current(state) {
  return state.players[state.turn % state.players.length];
}

/** Passe a la manche suivante (jeux ou tout le monde repond en meme temps). */
function advanceRound(state) {
  state.round += 1;
  state.pending.answers = {};
  state.players.forEach((p) => {
    p.answered = false;
    p.lastPoints = 0;
  });
}

function nextTurn(state) {
  let guard = 0;
  do {
    state.turn = (state.turn + 1) % state.players.length;
    if (state.turn === 0) state.round += 1;
    guard++;
  } while (!state.players[state.turn].alive && guard < state.players.length * 2);
  state.pending.answers = {};
  state.players.forEach((p) => {
    p.answered = false;
  });
}

function popQuestion(state) {
  if (!state.questions.length) {
    return {
      prompt: 'Combien font 7 + 5 ?',
      choices: ['12', '11', '13', '10'],
      answer: 0,
      explanation: '7 + 5 = 12.',
      subject: 'maths'
    };
  }
  const q = state.questions[state.qIndex % state.questions.length];
  state.qIndex += 1;
  return q;
}

function checkOver(state) {
  if (state.over) return state;
  const alive = state.players.filter((p) => p.alive);
  if (state.gameId === 'plateau') {
    const finisher = state.players.find((p) => p.pos >= state.board.length - 1);
    if (finisher) endGame(state, [finisher.id]);
    else if (state.round > state.maxRounds) {
      const best = Math.max(...state.players.map((p) => p.pos));
      endGame(state, state.players.filter((p) => p.pos === best).map((p) => p.id));
    }
  } else if (state.gameId === 'boss') {
    if (state.pending.bossHp <= 0) endGame(state, state.players.filter((p) => p.alive).map((p) => p.id));
    else if (alive.length === 0) endGame(state, []);
    else if (state.round > state.maxRounds) {
      const best = Math.max(...state.players.map((p) => p.score));
      endGame(state, state.players.filter((p) => p.score === best).map((p) => p.id));
    }
  } else if (state.gameId === 'morpion') {
    const line = findLine(state.grid);
    if (line) {
      // grid contient le numero du joueur (1..4) : on retrouve l'identifiant.
      const owner = state.players[state.grid[line[0]] - 1];
      endGame(state, owner ? [owner.id] : []);
    } else if (state.grid.every((c) => c)) {
      const counts = {};
      state.grid.forEach((sym) => {
        if (sym) counts[sym] = (counts[sym] || 0) + 1;
      });
      const best = Math.max(0, ...Object.values(counts));
      const leaders = Object.keys(counts).filter((k) => counts[k] === best);
      if (leaders.length === 1) {
        const owner = state.players[Number(leaders[0]) - 1];
        endGame(state, owner ? [owner.id] : []);
      } else {
        endGame(state, []);
      }
    }
  } else if (state.gameId === 'loto') {
    const winner = state.players.find((p) => hasLine(p));
    if (winner) endGame(state, [winner.id]);
    else if (state.drawn.length >= 24 || state.round > state.maxRounds) {
      const best = Math.max(...state.players.map((p) => p.marks.length));
      endGame(state, state.players.filter((p) => p.marks.length === best).map((p) => p.id));
    }
  } else if (state.gameId === 'kunai' || state.gameId === 'course') {
    if (state.round > state.maxRounds) {
      const best = Math.max(...state.players.map((p) => p.score));
      endGame(state, state.players.filter((p) => p.score === best).map((p) => p.id));
    }
  } else if (state.gameId === 'bataille') {
    // Fin normale : des qu'une flotte est entierement coulee (gere dans reduceBataille).
    if (state.round > state.maxRounds) {
      const hits = (p) => p.ships.reduce((n, sh) => n + ((sh.hits && sh.hits.length) || 0), 0);
      const best = Math.max(...state.players.map(hits));
      if (best === 0) endGame(state, []);
      else endGame(state, state.players.filter((p) => hits(p) === best).map((p) => p.id));
    }
  } else if (state.gameId === 'memory') {
    const pairs = (p) => state.owners.reduce((n, owner, i) => n + (owner >= 0 && owner === state.players.indexOf(p) ? 1 : 0), 0);
    if (state.owners.every((m) => m >= 0) || state.round > state.maxRounds) {
      const best = Math.max(...state.players.map((p) => p.score));
      if (best === 0) endGame(state, []);
      else endGame(state, state.players.filter((p) => p.score === best).map((p) => p.id));
    }
  } else if (state.gameId === 'equipe') {
    if (state.round > state.maxRounds) {
      const a = teamScore(state, 0);
      const b = teamScore(state, 1);
      if (a === b && state.maxRounds < state.hardCap && state.suddenDeath < 3) {
        // Égalité : on prolonge la partie (mort subite).
        state.maxRounds += 3;
        state.suddenDeath += 1;
        pushLog(state, `Égalité ${a} - ${b} : MORT SUBITE, ${3} manches supplémentaires !`);
      } else if (a === b) {
        endGame(state, []);
      } else {
        const winTeam = a > b ? 0 : 1;
        endGame(state, state.players.filter((p) => p.team === winTeam).map((p) => p.id));
      }
    }
  }
  return state;
}

function endGame(state, winners) {
  state.over = true;
  state.phase = 'fin';
  state.winners = winners;
  const names = state.players.filter((p) => winners.includes(p.id)).map((p) => p.name);
  pushLog(state, names.length ? `Victoire de ${names.join(', ')} !` : 'Match nul !');
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function findLine(grid) {
  return LINES.find((l) => grid[l[0]] && grid[l[0]] === grid[l[1]] && grid[l[1]] === grid[l[2]]) || null;
}

function hasLine(p) {
  const idx = p.marks.map((n) => p.card.indexOf(n));
  return LINES.some((l) => l.every((c) => idx.includes(c)));
}

const RPS = ['pierre', 'feuille', 'ciseaux'];
const beats = (a, b) => (a === 'pierre' && b === 'ciseaux') || (a === 'feuille' && b === 'pierre') || (a === 'ciseaux' && b === 'feuille');

/** Applique une action et renvoie le nouvel etat (immutable cote appelant). */
export function reduce(prev, action) {
  const state = JSON.parse(JSON.stringify(prev));
  state.updatedAt = Date.now();
  if (state.over) return state;

  switch (state.gameId) {
    case 'plateau':
      reducePlateau(state, action);
      break;
    case 'course':
      reduceCourse(state, action);
      break;
    case 'equipe':
      reduceEquipe(state, action);
      break;
    case 'bataille':
      reduceBataille(state, action);
      break;
    case 'memory':
      reduceMemory(state, action);
      break;
    case 'boss':
      reduceBoss(state, action);
      break;
    case 'kunai':
      reduceKunai(state, action);
      break;
    case 'morpion':
      reduceMorpion(state, action);
      break;
    case 'loto':
      reduceLoto(state, action);
      break;
    case 'puissance4':
      reducePuissance4(state, action);
      break;
    default:
      break;
  }
  return checkOver(state);
}

function startQuestion(state, question) {
  state.question = question || popQuestion(state);
  state.phase = 'question';
  state.players.forEach((p) => {
    p.answered = false;
  });
  state.pending.answers = {};
}

// ------------------------------- PLATEAU -----------------------------------
function reducePlateau(state, action) {
  if (action.type === 'roll') {
    const p = player(state, action.playerId);
    if (!p || p.id !== current(state).id) return;
    const dice = action.dice || rndRange(1, 6);
    state.pending.dice = dice;
    p.pos = Math.min(p.pos + dice, state.board.length - 1);
    pushLog(state, `${p.name} lance ${dice} et avance en case ${p.pos + 1}.`);
    const type = state.board[p.pos].type;
    if (type === 'ryos') {
      p.score += 50;
      pushLog(state, `${p.name} gagne 50 Ryos sur la case trésor !`);
      nextTurn(state);
      state.phase = 'lancer';
    } else if (type === 'trap') {
      p.pos = Math.max(0, p.pos - 3);
      pushLog(state, `Piège ! ${p.name} recule de 3 cases.`);
      nextTurn(state);
      state.phase = 'lancer';
    } else if (type === 'bonus') {
      p.score += 80;
      pushLog(state, `Bonus ! ${p.name} gagne 80 Ryos et rejoue.`);
      state.phase = 'lancer';
    } else if (type === 'swap') {
      const lead = [...state.players].sort((a, b) => b.pos - a.pos)[0];
      if (lead && lead.id !== p.id) {
        const tmp = lead.pos;
        lead.pos = p.pos;
        p.pos = tmp;
        pushLog(state, `Échange ! ${p.name} et ${lead.name} changent de place.`);
      }
      nextTurn(state);
      state.phase = 'lancer';
    } else if (type === 'final') {
      pushLog(state, `${p.name} atteint l’arrivée !`);
      endGame(state, [p.id]);
    } else {
      startQuestion(state, null);
    }
    return;
  }

  if (action.type === 'answer') {
    const p = player(state, action.playerId);
    if (!p || !state.question) return;
    const good = action.choice === state.question.answer;
    if (good) {
      p.correct += 1;
      p.streak += 1;
      p.best = Math.max(p.best, p.streak);
      p.score += 40 + p.streak * 5;
      p.pos = Math.min(p.pos + 2, state.board.length - 1);
      pushLog(state, `Bonne réponse de ${p.name} : +2 cases et +${40 + p.streak * 5} Ryos.`);
    } else {
      p.wrong += 1;
      p.streak = 0;
      pushLog(state, `Mauvaise réponse de ${p.name}, il reste sur place.`);
    }
    state.question = null;
    if (p.pos >= state.board.length - 1) {
      endGame(state, [p.id]);
      return;
    }
    nextTurn(state);
    state.phase = 'lancer';
    return;
  }
}

// -------------------------------- COURSE -----------------------------------
function reduceCourse(state, action) {
  if (action.type === 'answer' && state.phase === 'question') {
    const p = player(state, action.playerId);
    if (!p || p.answered) return;
    const good = action.choice === state.question.answer;
    p.answered = true;
    p.lastPoints = good ? 2 + (Object.keys(state.pending.answers).length === 0 ? 1 : 0) : -1;
    p.score += p.lastPoints;
    state.pending.answers[action.playerId] = good ? p.lastPoints : -1;
    if (good) {
      p.correct += 1;
      p.streak += 1;
      p.best = Math.max(p.best, p.streak);
    } else {
      p.wrong += 1;
      p.streak = 0;
    }
    if (state.players.every((x) => x.answered)) {
      const order = Object.entries(state.pending.answers).map(([id, pts]) => `${player(state, id).name} ${pts > 0 ? `+${pts}` : pts}`);
      pushLog(state, `Manche ${state.round} : ${order.join(', ')}.`);
      state.question = null;
      advanceRound(state);
      state.phase = 'question';
      startQuestion(state, null);
    }
    return;
  }
}

// ------------------------- BATAILLE NAVALE (1v1) ---------------------------
export const GRID_SIZE = 4;
export const SHIP_SIZES = [3, 2, 2];

/** Place 3 navires (tailles 3, 2 et 2) sans chevauchement sur une grille 5x5. */
export function placeFleet() {
  const used = new Set();
  const fleet = [];
  SHIP_SIZES.forEach((size) => {
    // Toutes les positions possibles (horizontales et verticales) restant libres.
    const options = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        ['h', 'v'].forEach((dir) => {
          const cells = [];
          for (let k = 0; k < size; k++) {
            const r = dir === 'h' ? row : row + k;
            const c = dir === 'h' ? col + k : col;
            if (r >= GRID_SIZE || c >= GRID_SIZE) return;
            cells.push(r * GRID_SIZE + c);
          }
          if (cells.length === size && !cells.some((x) => used.has(x))) options.push(cells);
        });
      }
    }
    let chosen = options.length ? options[rnd(options.length)] : null;
    if (!chosen) {
      // Repli theorique : un alignement de cases libres dans une meme ligne.
      for (let row = 0; !chosen && row < GRID_SIZE; row++) {
        for (let col = 0; col + size <= GRID_SIZE; col++) {
          const cells = [];
          for (let k = 0; k < size; k++) cells.push(row * GRID_SIZE + col + k);
          if (!cells.some((x) => used.has(x))) { chosen = cells; break; }
        }
      }
    }
    if (!chosen) {
      chosen = [];
      for (let c = 0; chosen.length < size && c < GRID_SIZE * GRID_SIZE; c++) if (!used.has(c)) chosen.push(c);
    }
    chosen.forEach((c) => used.add(c));
    fleet.push({ size, cells: [...chosen], hits: [] });
  });
  return fleet;
}

/** Adversaire vise : le joueur suivant dans l'ordre du tour. */
function nextEnemy(state, playerId) {
  const idx = state.players.findIndex((p) => p.id === playerId);
  const target = state.players[(idx + 1) % state.players.length];
  return target ? target.id : playerId;
}

function reduceBataille(state, action) {
  if (action.type === 'answer' && state.phase === 'question') {
    const c = current(state);
    if (!c || action.playerId !== c.id) return;
    const good = action.choice === state.question.answer;
    if (good) {
      c.correct += 1;
      c.streak += 1;
      c.best = Math.max(c.best, c.streak);
      state.phase = 'pick';
      state.pending.pick = { playerId: c.id, targetId: nextEnemy(state, c.id) };
      pushLog(state, `${c.avatar} ${c.name} répond juste : à lui de tirer !`);
    } else {
      c.wrong += 1;
      c.streak = 0;
      pushLog(state, `${c.avatar} ${c.name} se trompe : aucun tir.`);
      state.question = null;
      nextTurn(state);
      state.phase = 'question';
      startQuestion(state, null);
    }
    return;
  }
  if (action.type === 'pick' && state.phase === 'pick') {
    const pending = state.pending.pick || {};
    if (action.playerId !== pending.playerId) return;
    const cell = action.payload;
    const shooter = player(state, action.playerId);
    const target = player(state, pending.targetId);
    if (!shooter || !target) return;
    if (typeof cell !== 'number' || cell < 0 || cell >= GRID_SIZE * GRID_SIZE) return;
    if (target.incoming[cell]) return; // case deja visee

    const ship = target.ships.find((sh) => sh.cells.includes(cell));
    if (ship) {
      ship.hits = ship.hits || [];
      ship.hits.push(cell);
      target.incoming[cell] = 'hit';
      shooter.score += 20;
      if (ship.hits.length >= ship.cells.length) {
        shooter.score += 30;
        pushLog(state, `💥 ${shooter.avatar} ${shooter.name} coule un navire de ${target.name} ! +50`);
      } else {
        pushLog(state, `🎯 ${shooter.avatar} ${shooter.name} touche la flotte de ${target.name} ! +20`);
      }
      state.pending.pick = null;
      state.question = null;
      if (target.ships.every((sh) => (sh.hits || []).length >= sh.cells.length)) {
        endGame(state, [shooter.id]);
        return;
      }
    } else {
      target.incoming[cell] = 'miss';
      pushLog(state, `💧 ${shooter.avatar} ${shooter.name} tire… plouf, rien du tout.`);
    }
    state.pending.pick = null;
    state.question = null;
    nextTurn(state);
    state.phase = 'question';
    startQuestion(state, null);
  }
}

// ------------------------------- EQUIPES -----------------------------------
/** Somme des points d'une equipe. */
function teamScore(state, team) {
  return state.players.filter((p) => p.team === team).reduce((sum, p) => sum + p.score, 0);
}

function reduceEquipe(state, action) {
  if (action.type === 'answer' && state.phase === 'question') {
    const p = player(state, action.playerId);
    if (!p || p.answered) return;
    const good = action.choice !== null && action.choice === state.question.answer;
    const first = Object.keys(state.pending.answers).length === 0;
    p.answered = true;
    let pts = 0;
    if (good) {
      pts = first ? 3 : 2; // bonus de rapidite pour le premier
      p.correct += 1;
      p.streak += 1;
      p.best = Math.max(p.best, p.streak);
      p.score += pts;
      p.lastPoints = pts;
      pushLog(state, `${p.avatar} ${p.name} (équipe ${p.team + 1}) marque ${pts} point${pts > 1 ? 's' : ''}${first ? ' en étant le plus rapide' : ''} !`);
    } else {
      p.wrong += 1;
      p.streak = 0;
      p.lastPoints = 0;
      pushLog(state, `${p.avatar} ${p.name} (équipe ${p.team + 1}) se trompe : 0 point.`);
    }
    state.pending.answers[action.playerId] = pts;
    if (state.players.every((x) => x.answered)) {
      pushLog(state, `Manche ${state.round} : équipe 1 = ${teamScore(state, 0)} · équipe 2 = ${teamScore(state, 1)}`);
      state.question = null;
      advanceRound(state);
      state.phase = 'question';
      startQuestion(state, null);
    }
    return;
  }
}

// --------------------------------- BOSS ------------------------------------
function reduceBoss(state, action) {
  if (action.type === 'answer' && state.phase === 'question') {
    const p = player(state, action.playerId);
    if (!p || p.answered || !p.alive) return;
    const good = action.choice === state.question.answer;
    p.answered = true;
    if (good) {
      const dmg = 10 + Math.min(p.streak, 4) * 2;
      state.pending.bossHp -= dmg;
      p.score += 40;
      p.correct += 1;
      p.streak += 1;
      p.best = Math.max(p.best, p.streak);
      pushLog(state, `${p.name} frappe le Démon Renard : −${dmg} PV !`);
    } else {
      p.wrong += 1;
      p.streak = 0;
      p.hp -= 12;
      if (p.hp <= 0) {
        p.hp = 0;
        p.alive = false;
        pushLog(state, `${p.name} est mis K.O. par le Démon Renard !`);
      } else {
        pushLog(state, `Le Démon Renard contre-attaque ${p.name} (−12 PV).`);
      }
    }
    if (state.pending.bossHp <= 0) {
      endGame(state, state.players.filter((x) => x.alive).map((x) => x.id));
      return;
    }
    if (state.players.filter((x) => x.alive).every((x) => x.answered)) {
      state.question = null;
      advanceRound(state);
      state.phase = 'question';
      startQuestion(state, null);
    }
    return;
  }
}

// -------------------------------- KUNAI ------------------------------------
function reduceKunai(state, action) {
  if (action.type === 'pick' && state.phase === 'pick') {
    const p = player(state, action.playerId);
    if (!p) return;
    p.pick = action.payload;
    p.answered = true;
    if (state.players.every((x) => x.answered)) resolveKunai(state);
    return;
  }
  if (action.type === 'answer' && state.phase === 'question') {
    const p = player(state, action.playerId);
    if (!p) return;
    const good = action.choice === state.question.answer;
    p.kunaiCorrect = good;
    if (good) {
      p.correct += 1;
      p.streak += 1;
      p.best = Math.max(p.best, p.streak);
    } else {
      p.wrong += 1;
      p.streak = 0;
    }
    p.pick = action.pick || RPS[rnd(3)];
    p.answered = true;
    if (state.players.every((x) => x.answered)) resolveKunai(state);
    return;
  }
}

function resolveKunai(state) {
  state.players.forEach((p) => {
    let pts = p.kunaiCorrect ? 1 : 0;
    state.players.forEach((o) => {
      if (o.id !== p.id && beats(p.pick, o.pick)) pts += 1;
    });
    p.lastPoints = pts;
    p.score += pts;
  });
  const detail = state.players.map((p) => `${p.avatar} ${p.pick} (${p.lastPoints > 0 ? `+${p.lastPoints}` : '0'})`).join(' · ');
  pushLog(state, `Manche ${state.round} : ${detail}`);
  state.question = null;
  advanceRound(state);
  state.phase = 'question';
  startQuestion(state, null);
}

// --------------------------------- MEMORY ----------------------------------
/** 12 cartes : pour chaque question, une carte énoncé et une carte réponse. */
export function makeMemoryGrid(questions) {
  const list = questions && questions.length ? questions : [];
  const count = 6;
  const cards = [];
  for (let i = 0; i < count; i++) {
    const q = list[i % Math.max(1, list.length)];
    cards.push({ qi: i, kind: 'p', text: q ? q.prompt : `Question ${i + 1}` });
    cards.push({ qi: i, kind: 'a', text: q ? q.choices[q.answer] : '?' });
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    const t = cards[i];
    cards[i] = cards[j];
    cards[j] = t;
  }
  return cards.slice(0, 12).map((c) => ({
    qi: c.qi % Math.max(1, list.length || 1),
    kind: c.kind,
    text: c.text
  }));
}

/** Deux cartes forment-elles une paire question / bonne reponse ? */
function isPair(a, b) {
  return a.qi === b.qi && a.kind !== b.kind;
}

/** Fin du tour : les cartes se retournent et c'est au suivant. */
function endTurnMemory(state) {
  state.flipped = [];
  state.turn = (state.turn + 1) % state.players.length;
  state.round += 1;
  state.phase = 'pick';
  state.pending.pick = { playerId: state.players[state.turn].id };
}

function reduceMemory(state, action) {
  if (action.type === 'pick' && state.phase === 'pick') {
    const c = current(state);
    if (!c || action.playerId !== c.id) return;
    if (state.flipped.length >= 2) return;
    const cell = action.payload;
    if (typeof cell !== 'number' || cell < 0 || cell >= state.cards.length) return;
    if (state.owners[cell] >= 0 || state.flipped.includes(cell)) return;

    state.flipped.push(cell);
    if (!state.seen.includes(cell)) state.seen.push(cell);
    state.pending.pick = { playerId: c.id };

    if (state.flipped.length < 2) return;

    const [a, b] = state.flipped;
    if (isPair(state.cards[a], state.cards[b])) {
      // Paire trouvee : il faut maintenant repondre correctement pour la garder.
      const q = state.questions[state.cards[a].qi % Math.max(1, state.questions.length)];
      state.pending.pick = { playerId: c.id, pair: [a, b] };
      startQuestion(state, q);
      pushLog(state, `${c.avatar} ${c.name} retourne une paire : attention, question !`);
    } else {
      pushLog(state, `${c.avatar} ${c.name} retourne ${state.cards[a].qi + 1} et ${state.cards[b].qi + 1} : ça ne va pas ensemble.`);
      endTurnMemory(state);
    }
    return;
  }

  if (action.type === 'answer' && state.phase === 'question') {
    const c = current(state);
    if (!c || action.playerId !== c.id) return;
    const pair = (state.pending.pick || {}).pair || state.flipped;
    const good = action.choice !== null && action.choice === state.question.answer;
    const idx = state.players.findIndex((p) => p.id === c.id);
    if (good) {
      c.correct += 1;
      c.streak += 1;
      c.best = Math.max(c.best, c.streak);
      c.score += 30;
      pair.forEach((cell) => {
        state.owners[cell] = idx;
      });
      pushLog(state, `✅ ${c.avatar} ${c.name} répond juste et empoche la paire ! +30`);
    } else {
      c.wrong += 1;
      c.streak = 0;
      pushLog(state, `❌ ${c.avatar} ${c.name} se trompe : les cartes se retournent.`);
    }
    state.question = null;
    state.flipped = [];
    state.round += 1;
    if (state.owners.every((m) => m >= 0)) {
      const best = Math.max(...state.players.map((p) => p.score));
      endGame(state, best > 0 ? state.players.filter((p) => p.score === best).map((p) => p.id) : []);
      return;
    }
    // Une bonne reponse permet de rejouer, sinon c'est au suivant.
    if (good) {
      state.phase = 'pick';
      state.pending.pick = { playerId: c.id };
    } else {
      endTurnMemory(state);
    }
  }
}

// ------------------------------- MORPION -----------------------------------
function reduceMorpion(state, action) {
  if (action.type === 'answer' && state.phase === 'question') {
    const p = player(state, action.playerId);
    if (!p) return;
    const good = action.choice === state.question.answer;
    if (good) {
      p.correct += 1;
      p.streak += 1;
      pushLog(state, `${p.name} répond juste et peut poser son symbole.`);
      state.phase = 'pick';
      state.pending.pick = { playerId: p.id, symbol: state.players.findIndex((x) => x.id === p.id) + 1 };
    } else {
      p.wrong += 1;
      p.streak = 0;
      pushLog(state, `${p.name} se trompe et passe son tour.`);
      state.question = null;
      nextTurn(state);
      state.phase = 'question';
      startQuestion(state, null);
    }
    return;
  }
  if (action.type === 'pick' && state.phase === 'pick') {
    const { playerId, symbol } = state.pending.pick || {};
    if (action.playerId !== playerId) return;
    const cell = action.payload;
    if (typeof cell !== 'number' || state.grid[cell]) return;
    state.grid[cell] = symbol;
    pushLog(state, `${player(state, playerId).name} pose son symbole.`);
    state.pending.pick = null;
    state.question = null;
    if (!findLine(state.grid) && state.grid.some((c) => !c)) {
      nextTurn(state);
      state.phase = 'question';
      startQuestion(state, null);
    }
    return;
  }
}

// --------------------------------- LOTO ------------------------------------
function reduceLoto(state, action) {
  if (action.type === 'answer' && state.phase === 'question') {
    const p = player(state, action.playerId);
    if (!p) return;
    const good = action.choice === state.question.answer;
    if (good) {
      p.correct += 1;
      p.streak += 1;
      let ball = rndRange(1, 30);
      let guard = 0;
      while (state.drawn.includes(ball) && guard++ < 60) ball = rndRange(1, 30);
      state.drawn.push(ball);
      const idx = p.card.indexOf(ball);
      if (idx >= 0 && !p.marks.includes(ball)) {
        p.marks.push(ball);
        pushLog(state, `${p.name} tire le numéro ${ball} et le coche !`);
      } else {
        pushLog(state, `${p.name} tire le numéro ${ball} (pas sur sa carte).`);
      }
      p.score += 20;
    } else {
      p.wrong += 1;
      p.streak = 0;
      pushLog(state, `${p.name} se trompe : pas de numéro.`);
    }
    state.question = null;
    if (!state.players.some((x) => hasLine(x))) {
      nextTurn(state);
      state.phase = 'question';
      startQuestion(state, null);
    }
  }
}

// ------------------------------ PUISSANCE 4 --------------------------------

/** Ligne ou le jeton s'arrete dans une colonne (-1 si la colonne est pleine). */
export function p4DropRow(grid, col) {
  for (let r = P4_ROWS - 1; r >= 0; r--) if (!grid[r * P4_COLS + col]) return r;
  return -1;
}

/** Les 4 cases alignees par `symbol`, ou null s'il n'y en a pas. */
export function p4WinLine(grid, symbol) {
  const at = (c, r) => (c < 0 || c >= P4_COLS || r < 0 || r >= P4_ROWS ? 0 : grid[r * P4_COLS + c] || 0);
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let r = 0; r < P4_ROWS; r++) {
    for (let c = 0; c < P4_COLS; c++) {
      if (at(c, r) !== symbol) continue;
      for (const [dc, dr] of dirs) {
        const line = [r * P4_COLS + c];
        for (let n = 1; n < 4; n += 1) {
          if (at(c + dc * n, r + dr * n) !== symbol) break;
          line.push((r + dr * n) * P4_COLS + (c + dc * n));
        }
        if (line.length === 4) return line;
      }
    }
  }
  return null;
}

export const p4Win = (grid, symbol) => !!p4WinLine(grid, symbol);

/**
 * Nombre d'alignements d'au moins `len` jetons pour un symbole.
 * Sert a departager les joueurs quand la grille est pleine : chaque
 * "triplette" rapporte des points, le meilleur total gagne la partie.
 */
export function p4CountLines(grid, symbol, len = 3) {
  const at = (c, r) => (c < 0 || c >= P4_COLS || r < 0 || r >= P4_ROWS ? 0 : grid[r * P4_COLS + c] || 0);
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  let total = 0;
  for (let r = 0; r < P4_ROWS; r++) {
    for (let c = 0; c < P4_COLS; c++) {
      if (at(c, r) !== symbol) continue;
      for (const [dc, dr] of dirs) {
        // On ne compte une ligne qu'une seule fois (depuis son extremite).
        if (at(c - dc, r - dr) === symbol) continue;
        let n = 1;
        while (n < 10 && at(c + dc * n, r + dr * n) === symbol) n += 1;
        if (n >= len) total += 1;
      }
    }
  }
  return total;
}

/** Colonnes qui peuvent encore recevoir un jeton. */
export function p4FreeCols(grid) {
  const cols = [];
  for (let c = 0; c < P4_COLS; c++) if (p4DropRow(grid, c) >= 0) cols.push(c);
  return cols;
}

/** Fait tomber un jeton : renvoie la ligne atteinte (-1 si colonne pleine). */
function p4Drop(state, col, symbol) {
  const row = p4DropRow(state.grid, col);
  if (row < 0) return -1;
  state.grid[row * P4_COLS + col] = symbol;
  return row;
}

/** +15 points par nouvel alignement de 3 jetons (departage de fin de partie). */
function p4TripletBonus(state, p, symbol) {
  const lines = p4CountLines(state.grid, symbol, 3);
  const gain = Math.max(0, lines - (p.lines3 || 0)) * 15;
  p.lines3 = lines;
  return gain;
}

/** Fin de tour : victoire, grille pleine, sinon on passe au joueur suivant. */
function p4EndTurn(state, p, symbol) {
  const line = p4WinLine(state.grid, symbol);
  if (line) {
    state.winLine = line;
    p.score += 100;
    pushLog(state, `\u{1F3C6} ${p.avatar} ${p.name} aligne 4 jetons et gagne la partie !`);
    endGame(state, [p.id]);
    return;
  }
  if (!p4FreeCols(state.grid).length) {
    // Grille pleine : pas de match nul, c'est le meilleur aligneur qui gagne.
    const best = Math.max(...state.players.map((x) => x.score));
    const winners = state.players.filter((x) => x.score === best).map((x) => x.id);
    pushLog(state, 'Grille pleine : on compte les triplettes !');
    endGame(state, winners);
    return;
  }
  state.question = null;
  nextTurn(state);
  state.phase = 'question';
  startQuestion(state, null);
}

function reducePuissance4(state, action) {
  if (action.type === 'answer' && state.phase === 'question') {
    const p = player(state, action.playerId);
    if (!p || p.id !== current(state).id) return;
    const symbol = state.players.findIndex((x) => x.id === p.id) + 1;
    if (action.choice === state.question.answer) {
      p.correct += 1;
      p.streak += 1;
      pushLog(state, `\u2705 ${p.name} r\u00e9pond juste : \u00e0 lui de choisir sa colonne !`);
      state.phase = 'pick';
      state.pending.pick = { playerId: p.id, symbol };
      return;
    }
    p.wrong += 1;
    p.streak = 0;
    // Une erreur ne bloque jamais la partie : le jeton tombe au hasard.
    const cols = p4FreeCols(state.grid);
    if (!cols.length) {
      endGame(state, []);
      return;
    }
    const col = cols[rnd(cols.length)];
    if (p4Drop(state, col, symbol) >= 0) p.score += 25 + p4TripletBonus(state, p, symbol);
    pushLog(state, `\u274C ${p.name} se trompe : son jeton tombe dans la colonne ${col + 1}.`);
    p4EndTurn(state, p, symbol);
    return;
  }
  if (action.type === 'pick' && state.phase === 'pick') {
    const pending = state.pending.pick || {};
    if (action.playerId !== pending.playerId) return;
    const p = player(state, action.playerId);
    if (!p) return;
    const col = action.payload;
    if (typeof col !== 'number' || col < 0 || col >= P4_COLS) return;
    if (p4Drop(state, col, pending.symbol) < 0) return; // colonne pleine
    p.score += 25 + p4TripletBonus(state, p, pending.symbol);
    pushLog(state, `${p.avatar} ${p.name} place un jeton dans la colonne ${col + 1}.`);
    state.pending.pick = null;
    p4EndTurn(state, p, pending.symbol);
  }
}

// ---------------------- ETAT PUBLIC / BOTS / AIDES -------------------------

/** Version de l'etat sans les reponses (pour l'affichage spectateur). */
export function publicState(state, forPlayerId) {
  const copy = JSON.parse(JSON.stringify(state));
  const me = state.players.find((p) => p.id === forPlayerId);
  const reveal = state.phase !== 'question' || (me ? me.answered : false) || state.over;
  copy.question = state.question
    ? {
        prompt: state.question.prompt,
        choices: state.question.choices,
        subject: state.question.subject,
        explanation: reveal ? state.question.explanation : undefined,
        answer: reveal ? state.question.answer : undefined
      }
    : null;
  // Ne jamais envoyer le reste des questions : sinon un joueur curieux peut
  // lire les reponses a l'avance dans la console de son navigateur.
  copy.questions = [];
  copy.qIndex = 0;
  if (state.gameId === 'memory') {
    // Seules les cartes retournees ou deja gagnees sont envoyees aux joueurs.
    copy.cards = (state.cards || []).map((card, i) =>
      state.owners[i] >= 0 || state.flipped.includes(i) ? card : { qi: -1, kind: null, text: '' }
    );
  }
  if (state.gameId === 'bataille') {
    // La flotte adverse ne doit pas etre visible : on n'envoie que les degats.
    copy.players = copy.players.map((p) => {
      if (p.id === forPlayerId) return p;
      return {
        ...p,
        ships: (p.ships || []).map((sh) => ({
          size: sh.size,
          cells: [],
          hits: [...(sh.hits || [])],
          sunk: (sh.hits || []).length >= sh.cells.length
        }))
      };
    });
  }
  copy.forPlayerId = forPlayerId || null;
  return copy;
}

/** Le joueur courant est-il un bot ? */
export function currentIsBot(state) {
  if (state.over) return false;
  if (state.gameId === 'course' || state.gameId === 'boss' || state.gameId === 'equipe') {
    return state.players.some((p) => p.bot && p.alive && !p.answered);
  }
  const c = current(state);
  return !!(c && c.bot && c.alive);
}

/** Action jouee par un bot (avec un taux de reussite realiste). */
export function botAction(state, skill = 0.62) {
  if (state.over) return null;
  if (state.gameId === 'course' || state.gameId === 'boss' || state.gameId === 'equipe') {
    const pending = state.players.filter((p) => p.bot && p.alive && !p.answered);
    const bot = pending[rnd(pending.length)];
    if (!bot) return null;
    const good = Math.random() < skill;
    const choice = good
      ? state.question.answer
      : rnd(state.question.choices.length);
    return { type: 'answer', playerId: bot.id, choice };
  }
  if (state.gameId === 'kunai') {
    const waiting = state.players.filter((p) => p.bot && !p.answered);
    const bot = waiting[rnd(waiting.length)];
    if (!bot) return null;
    const good = Math.random() < skill;
    return {
      type: 'answer',
      playerId: bot.id,
      choice: good ? state.question.answer : rnd(state.question.choices.length),
      pick: RPS[rnd(3)]
    };
  }
  const c = current(state);
  if (!c || !c.bot) return null;
  if (state.phase === 'lancer') return { type: 'roll', playerId: c.id };
  if (state.phase === 'question') {
    const good = Math.random() < skill;
    return {
      type: 'answer',
      playerId: c.id,
      choice: good ? state.question.answer : rnd(state.question.choices.length)
    };
  }
  if (state.phase === 'pick') {
    if (state.gameId === 'puissance4') {
      const symbol = (state.pending.pick || {}).symbol || state.players.findIndex((x) => x.id === c.id) + 1;
      const free = p4FreeCols(state.grid);
      if (!free.length) return null;
      // 1) gagner tout de suite
      const winning = free.filter((col) => {
        const g = [...state.grid];
        g[p4DropRow(state.grid, col) * P4_COLS + col] = symbol;
        return p4Win(g, symbol);
      });
      if (winning.length) return { type: 'pick', playerId: c.id, payload: winning[rnd(winning.length)] };
      // 2) bloquer un adversaire sur le point d'aligner 4 jetons
      // Les bots ne bloquent pas a tous les coups : sinon plus personne n'aligne 4 jetons.
      if (Math.random() < skill * 0.55) {
        const blocks = [];
        state.players.forEach((other, idx) => {
          if (other.id === c.id) return;
          const s = idx + 1;
          free.forEach((col) => {
            const g = [...state.grid];
            g[p4DropRow(state.grid, col) * P4_COLS + col] = s;
            if (p4Win(g, s)) blocks.push(col);
          });
        });
        if (blocks.length) return { type: 'pick', playerId: c.id, payload: blocks[rnd(blocks.length)] };
      }
      const pool = free;
      const middle = Math.floor(P4_COLS / 2);
      const col = pool.includes(middle) && Math.random() < 0.35 ? middle : pool[rnd(pool.length)];
      return { type: 'pick', playerId: c.id, payload: col };
    }
    if (state.gameId === 'memory') {
      const free = [];
      for (let i = 0; i < state.cards.length; i++) {
        if (state.owners[i] < 0 && !state.flipped.includes(i)) free.push(i);
      }
      if (!free.length) return null;
      // Le bot se souvient des cartes deja retournees (comme un vrai joueur).
      // Memoire imparfaite : le bot ne se souvient pas a tous les coups.
      if (state.flipped.length === 1 && Math.random() < skill * 0.62) {
        const [first] = state.flipped;
        const match = state.seen.find(
          (i) => state.owners[i] < 0 && i !== first && isPair(state.cards[first], state.cards[i])
        );
        if (match !== undefined && free.includes(match)) {
          return { type: 'pick', playerId: c.id, payload: match };
        }
      }
      const unseen = free.filter((i) => !state.seen.includes(i));
      const pool = unseen.length && Math.random() < 0.75 ? unseen : free;
      return { type: 'pick', playerId: c.id, payload: pool[rnd(pool.length)] };
    }
    if (state.gameId === 'bataille') {
      const pending = state.pending.pick || {};
      const target = state.players.find((p) => p.id === pending.targetId);
      const tried = (cell) => !!target.incoming[cell];
      const free = [];
      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) if (!tried(i)) free.push(i);
      if (!free.length) return { type: 'pick', playerId: c.id, payload: 0 };
      // Un bot un peu malin : il vise autour d'un tir deja reussi.
      const clue = target.ships.reduce((acc, sh) => acc.concat((sh.hits || []).length ? sh.hits : []), []);
      const around = [];
      clue.forEach((h) => {
        [h - 1, h + 1, h - GRID_SIZE, h + GRID_SIZE].forEach((n) => {
          if (n >= 0 && n < GRID_SIZE * GRID_SIZE && !tried(n)) around.push(n);
        });
      });
      const pool = around.length ? around : free;
      return { type: 'pick', playerId: c.id, payload: pool[rnd(pool.length)] };
    }
    const free = state.grid.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    return { type: 'pick', playerId: c.id, payload: free.includes(4) ? 4 : free[rnd(free.length)] };
  }
  return null;
}

/** Delai "humain" d'un bot en ms (assez court pour garder le rythme). */
export function botDelay() {
  return 650 + rnd(1300);
}

/** Cle de classement : sur le plateau on classe par position, sinon par score. */
const rankKey = (state) => (p) => (state.gameId === 'plateau' ? p.pos : p.score);

/** Recompenses : Ryos gagnes + ELO pour les defis. */
export function computeRewards(state, playerId) {
  const p = state.players.find((x) => x.id === playerId);
  if (!p) return { ryos: 0, elo: 0, won: false, rank: 99 };
  const sorted = [...state.players].sort((a, b) => rankKey(state)(b) - rankKey(state)(a));
  const rank = sorted.findIndex((x) => x.id === playerId) + 1;
  const won = state.winners.includes(playerId);
  let ryos = 30 + p.correct * 12 - p.wrong * 4 + Math.max(0, 60 - rank * 10);
  if (won) ryos += state.gameId === 'equipe' ? 150 : 120;
  if (state.gameId === 'boss' && state.pending.bossHp <= 0) ryos += 80;
  ryos = Math.max(10, Math.round(ryos));
  const tied = state.winners.length > 1;
  const elo =
    state.gameId === 'plateau' || state.gameId === 'course' || state.gameId === 'equipe' || state.gameId === 'bataille'
      ? state.gameId === 'bataille'
        ? won
          ? 10
          : -8
        : state.gameId === 'equipe'
          ? won
            ? 9
            : -4
          : won
          ? tied
            ? 5
            : 12
          : rank === 2
            ? 4
            : -6
      : 0;
  return { ryos, elo, won, rank };
}

/** Classement final. */
export function ranking(state) {
  return [...state.players]
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      bot: p.bot,
      score: state.gameId === 'plateau' ? p.pos : p.score,
      correct: p.correct,
      wrong: p.wrong,
      best: p.best
    }))
    .sort((a, b) => b.score - a.score);
}

/** ELO (duel 1v1 ou match a 4). */
export function eloDelta(eloA, eloB, scoreA) {
  const expected = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  return Math.round(32 * (scoreA - expected));
}
