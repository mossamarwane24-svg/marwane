// ---------------------------------------------------------------------------
// Moteur des jeux a 4 joueurs (Plateau, Kunai, Boss, Morpion, Loto, Course).
// Ce fichier est utilise TEL QUEL par le serveur Node (mode en ligne) et par
// le navigateur (mode hors ligne avec des bots). Il ne contient aucune
// dependance : uniquement de la logique pure.
// ---------------------------------------------------------------------------

export const GAME_IDS = ['plateau', 'kunai', 'boss', 'morpion', 'loto', 'course', 'equipe'];

export const SQUARE_TYPES = ['quiz', 'quiz', 'quiz', 'ryos', 'trap', 'bonus', 'boss', 'swap', 'ryos', 'quiz'];

export const BOARD_SIZE = 30;

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
    lastPoints: 0
  }));

  const state = {
    gameId,
    players: list,
    turn: 0,
    round: 1,
    maxRounds: options.maxRounds || (gameId === 'course' ? 10 : gameId === 'kunai' ? 5 : gameId === 'boss' ? 8 : gameId === 'equipe' ? 8 : 14),
    suddenDeath: 0,
    hardCap: 0,
    phase: 'lancer',
    question: null,
    questions: options.questions || [],
    qIndex: 0,
    board: gameId === 'plateau' ? makeBoard(options.boardSize || BOARD_SIZE) : [],
    grid: gameId === 'morpion' ? Array(9).fill(null) : [],
    drawn: [],
    pending: { dice: null, pick: null, bossHp: 100 + (list.length - 1) * 25, answers: {} },
    log: [],
    winners: [],
    over: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  state.hardCap = state.maxRounds + 9;
  if (gameId === 'equipe') pushLog(state, 'Équipes : ' + list.filter((p) => p.team === 0).map((p) => p.name).join(' & ') + '  VS  ' + list.filter((p) => p.team === 1).map((p) => p.name).join(' & '));
  pushLog(state, `La partie commence avec ${list.length} ninjas !`);
  if (gameId !== 'plateau') {
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
    state.gameId === 'plateau' || state.gameId === 'course' || state.gameId === 'equipe'
      ? state.gameId === 'equipe'
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
