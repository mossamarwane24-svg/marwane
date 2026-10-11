// ---------------------------------------------------------------------------
// Academie Ninja — serveur temps reel
//  * presence en ligne + liste des joueurs connectes
//  * amis (demandes, recherche, messagerie)
//  * duels classes (ELO)
//  * salons de jeux a 4 joueurs (Plateau, Kunai, Boss, Morpion, Loto, Course)
//  * Kahoot (partie animee par un hote, PIN a 6 caracteres)
//  * classement mondial, jeux communautaires (mode createur)
// ---------------------------------------------------------------------------

import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import {
  createGameState,
  reduce,
  publicState,
  currentIsBot,
  botAction,
  botDelay,
  computeRewards,
  ranking,
  eloDelta
} from '../shared/partyEngine.js';
import { SEED_USERS, SEED_GAMES } from '../shared/seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');
const DIST_DIR = path.join(__dirname, '..', 'dist');

// ------------------------------- Base locale -------------------------------
const emptyDb = () => ({
  users: {},
  games: [],
  friendships: [],
  matches: [],
  chat: [],
  updatedAt: Date.now()
});

let db = emptyDb();

function seedDb() {
  SEED_USERS.forEach((u, i) => {
    const id = `seed_${i + 1}`;
    db.users[id] = {
      id,
      name: u.name,
      avatar: u.avatar,
      grade: u.grade,
      elo: u.elo,
      ryos: u.ryos,
      streak: u.streak,
      wins: Math.round(u.elo / 40),
      losses: Math.round(u.elo / 60),
      botProfile: false,
      createdAt: Date.now() - 86400000 * 40,
      lastSeen: Date.now() - 3600000
    };
  });
  db.games = SEED_GAMES.map((g) => ({ ...g }));
}

try {
  if (fs.existsSync(DATA_FILE)) {
    db = { ...emptyDb(), ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
  } else {
    seedDb();
  }
} catch {
  seedDb();
}
if (!Object.keys(db.users).length) seedDb();
if (!db.games.length) db.games = SEED_GAMES.map((g) => ({ ...g }));

let saveTimer = null;
function persist() {
  db.updatedAt = Date.now();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 0));
    } catch (e) {
      console.warn('[db] sauvegarde impossible :', e.message);
    }
  }, 1200);
}

// ------------------------------ Serveur HTTP -------------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  maxHttpBufferSize: 1e6
});

const sockets = new Map(); // socketId -> playerId
const online = new Map(); // playerId -> { id, name, avatar, elo, ryos, grade, status, socketId }

const upsertUser = (identity, extra = {}) => {
  if (!identity || !identity.id) return null;
  const prev = db.users[identity.id] || {};
  const user = {
    id: identity.id,
    name: identity.name || prev.name || 'Ninja',
    avatar: identity.avatar || prev.avatar || '🦊',
    grade: identity.grade || prev.grade || 'CE2',
    elo: Number(identity.elo ?? prev.elo ?? 1000),
    ryos: Number(identity.ryos ?? prev.ryos ?? 0),
    streak: Number(identity.streak ?? prev.streak ?? 1),
    wins: prev.wins || 0,
    losses: prev.losses || 0,
    botProfile: !!identity.botProfile,
    createdAt: prev.createdAt || Date.now(),
    lastSeen: Date.now(),
    ...extra
  };
  db.users[user.id] = user;
  persist();
  return user;
};

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  avatar: u.avatar,
  grade: u.grade,
  elo: u.elo,
  ryos: u.ryos,
  streak: u.streak || 1,
  wins: u.wins || 0,
  losses: u.losses || 0
});

// --------------------------------- REST -----------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, online: online.size, players: Object.keys(db.users).length, games: db.games.length, uptime: process.uptime() });
});

app.get('/api/stats', (_req, res) => {
  res.json({
    online: online.size,
    players: Object.keys(db.users).length,
    games: db.games.length,
    matches: db.matches.length,
    topRyos: Math.max(0, ...Object.values(db.users).map((u) => u.ryos || 0))
  });
});

app.get('/api/leaderboard', (req, res) => {
  const metric = ['ryos', 'elo', 'streak', 'wins'].includes(String(req.query.metric)) ? String(req.query.metric) : 'ryos';
  const limit = Math.min(100, Number(req.query.limit) || 50);
  const list = Object.values(db.users)
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .slice(0, limit)
    .map((u, i) => ({ ...publicUser(u), rank: i + 1, online: online.has(u.id) }));
  res.json({ metric, list });
});

app.get('/api/users', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (q.length < 2) return res.json({ list: [], online: [] });
  const list = Object.values(db.users)
    .filter((u) => u.name.toLowerCase().includes(q))
    .slice(0, 25)
    .map((u) => ({ ...publicUser(u), online: online.has(u.id) }));
  res.json({ list, online: [...online.values()] });
});

app.get('/api/presence', (_req, res) => {
  res.json({ count: online.size, list: [...online.values()] });
});

app.post('/api/users/sync', (req, res) => {
  const { identity, progress } = req.body || {};
  const user = upsertUser(identity || progress);
  res.json({ ok: !!user, user: user ? publicUser(user) : null, online: online.size });
});

app.get('/api/user/:id', (req, res) => {
  const user = db.users[req.params.id];
  if (!user) return res.status(404).json({ error: 'introuvable' });
  const rank = Object.values(db.users).sort((a, b) => b.ryos - a.ryos).findIndex((u) => u.id === user.id) + 1;
  res.json({ user: publicUser(user), rank, online: online.has(user.id) });
});

app.get('/api/games', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const author = String(req.query.author || '');
  let list = [...db.games];
  if (q) list = list.filter((g) => `${g.title} ${g.subject} ${g.authorName}`.toLowerCase().includes(q));
  if (author) list = list.filter((g) => g.authorId === author);
  list.sort((a, b) => (b.plays || 0) - (a.plays || 0) || b.createdAt - a.createdAt);
  res.json({ list: list.slice(0, 60), total: db.games.length });
});

app.post('/api/games', (req, res) => {
  const { game, author } = req.body || {};
  if (!game || !game.title || !Array.isArray(game.questions) || !game.questions.length) {
    return res.status(400).json({ error: 'Jeu invalide : ajoute un titre et au moins une question.' });
  }
  // Le mode createur coute 5000 Ryos (verifie aussi cote client).
  const user = author && author.id ? db.users[author.id] : null;
  const ryos = user ? user.ryos : Number(author?.ryos || 0);
  if (ryos < 5000) {
    return res.status(402).json({ error: 'Il te faut au moins 5 000 Ryos pour publier un jeu.', ryos });
  }
  const created = {
    id: `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    title: String(game.title).slice(0, 60),
    subject: game.subject || 'maths',
    grades: Array.isArray(game.grades) && game.grades.length ? game.grades : ['CE2'],
    difficulty: game.difficulty || 'moyen',
    questions: game.questions.slice(0, 40).map((q) => ({
      prompt: String(q.prompt).slice(0, 220),
      choices: (q.choices || []).slice(0, 4).map((c) => String(c).slice(0, 80)),
      answer: Math.max(0, Math.min(3, Number(q.answer) || 0)),
      explanation: q.explanation ? String(q.explanation).slice(0, 220) : ''
    })),
    authorId: (author && author.id) || 'anonyme',
    authorName: (author && author.name) || 'Ninja anonyme',
    createdAt: Date.now(),
    plays: 0,
    likes: 0
  };
  db.games.unshift(created);
  if (user) user.ryos -= 5000;
  persist();
  res.json({ ok: true, game: created });
});

app.post('/api/games/:id/like', (req, res) => {
  const game = db.games.find((g) => g.id === req.params.id);
  if (!game) return res.status(404).json({ error: 'introuvable' });
  game.likes = (game.likes || 0) + 1;
  persist();
  res.json({ ok: true, likes: game.likes });
});

app.post('/api/games/:id/play', (req, res) => {
  const game = db.games.find((g) => g.id === req.params.id);
  if (!game) return res.status(404).json({ error: 'introuvable' });
  game.plays = (game.plays || 0) + 1;
  persist();
  res.json({ ok: true, plays: game.plays });
});

app.post('/api/matches', (req, res) => {
  const { type, players, detail } = req.body || {};
  const match = { id: `m_${Date.now().toString(36)}`, type: type || 'duel', players: players || [], detail: detail || {}, at: Date.now() };
  db.matches.unshift(match);
  db.matches = db.matches.slice(0, 500);
  persist();
  res.json({ ok: true, match });
});

app.get('/api/matches', (_req, res) => res.json({ list: db.matches.slice(0, 40) }));

app.get('/api/friends/:id', (req, res) => {
  const id = req.params.id;
  const ids = db.friendships.filter((f) => f.a === id || f.b === id).map((f) => (f.a === id ? f.b : f.a));
  const incoming = db.friendships.filter((f) => f.b === id && f.status === 'pending').map((f) => ({ id: f.a, at: f.at }));
  const outgoing = db.friendships.filter((f) => f.a === id && f.status === 'pending').map((f) => ({ id: f.b, at: f.at }));
  res.json({
    ids,
    incoming: incoming.map((r) => ({ ...r, name: db.users[r.id]?.name || 'Ninja', avatar: db.users[r.id]?.avatar || '🦊' })),
    outgoing: outgoing.map((r) => ({ ...r, name: db.users[r.id]?.name || 'Ninja' })),
    friends: ids.map((fid) => ({ ...publicUser(db.users[fid] || { id: fid, name: 'Ninja', avatar: '🦊' }), online: online.has(fid) }))
  });
});

app.post('/api/friends/request', (req, res) => {
  const { from, to } = req.body || {};
  if (!from || !to || from === to) return res.status(400).json({ error: 'demande invalide' });
  const exists = db.friendships.find((f) => (f.a === from && f.b === to) || (f.a === to && f.b === from));
  if (exists) {
    exists.status = 'accepted';
  } else {
    db.friendships.push({ a: from, b: to, status: 'pending', at: Date.now() });
  }
  persist();
  const sock = [...sockets.entries()].find(([, pid]) => pid === to)?.[0];
  if (sock) io.to(sock).emit('friends:requested', { from, name: db.users[from]?.name || 'Ninja' });
  res.json({ ok: true });
});

app.post('/api/friends/accept', (req, res) => {
  const { from, to } = req.body || {};
  const rel = db.friendships.find((f) => (f.a === from && f.b === to) || (f.a === to && f.b === from));
  if (rel) {
    rel.status = 'accepted';
    persist();
  }
  res.json({ ok: true });
});

app.post('/api/friends/remove', (req, res) => {
  const { from, to } = req.body || {};
  db.friendships = db.friendships.filter((f) => !((f.a === from && f.b === to) || (f.a === to && f.b === from)));
  persist();
  res.json({ ok: true });
});

// ------------------------------ Fichiers statiques -------------------------
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api|\/socket\.io).*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

// --------------------------------- Salons ---------------------------------
const rooms = new Map(); // code -> room
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

const newRoom = (game, host, options = {}) => {
  const code = options.code || makeCode();
  const room = {
    code,
    game,
    hostId: host.id,
    players: [],
    questions: options.questions || [],
    options: options.options || {},
    state: null,
    started: false,
    botTimer: null,
    roundTimer: null,
    chat: [],
    createdAt: Date.now()
  };
  rooms.set(code, room);
  setTimeout(() => {
    const r = rooms.get(code);
    if (r && !r.started && Date.now() - r.createdAt > 1000 * 60 * 45) {
      io.to(code).emit('room:closed', { reason: 'expiree' });
      rooms.delete(code);
    }
  }, 1000 * 60 * 45);
  return room;
};

const roomPlayersPublic = (room) =>
  room.players.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, bot: !!p.bot, elo: p.elo, ryos: p.ryos, grade: p.grade }));

const broadcast = (room) => {
  if (!room.state) {
    io.to(room.code).emit('room:lobby', {
      code: room.code,
      game: room.game,
      hostId: room.hostId,
      players: roomPlayersPublic(room),
      started: room.started
    });
    return;
  }
  room.players.forEach((p) => {
    if (p.bot || !p.socketId) return;
    io.to(p.socketId).emit('room:state', {
      code: room.code,
      game: room.game,
      hostId: room.hostId,
      youId: p.id,
      players: roomPlayersPublic(room),
      state: publicState(room.state, p.id),
      ranking: room.state.over ? ranking(room.state) : null,
      rewards: room.state.over ? room.rewards || null : null
    });
  });
  // spectateurs (joueurs sans siege) : etat public
  const seated = new Set(room.players.filter((p) => !p.bot && p.socketId).map((p) => p.socketId));
  io.in(room.code)
    .fetchSockets()
    .then((list) => {
      list.forEach((s) => {
        if (seated.has(s.id)) return;
        s.emit('room:spectate', {
          code: room.code,
          game: room.game,
          players: roomPlayersPublic(room),
          state: publicState(room.state, null),
          over: room.state.over,
          ranking: room.state.over ? ranking(room.state) : null
        });
      });
    })
    .catch(() => {});
};

const clearTimers = (room) => {
  clearTimeout(room.botTimer);
  clearTimeout(room.roundTimer);
  room.botTimer = null;
  room.roundTimer = null;
};

const applyAction = (room, action) => {
  if (!room.state || room.state.over) return;
  // Une action hors tour ou invalide ne modifie rien : on ne rediffuse pas,
  // sinon un client trop bavard ferait boucler le salon en boucle.
  const before = JSON.stringify(room.state);
  room.state = reduce(room.state, action);
  if (JSON.stringify(room.state) === before) return;
  if (room.state.over) {
    clearTimers(room);
    room.rewards = {};
    room.state.players.forEach((p) => {
      room.rewards[p.id] = computeRewards(room.state, p.id);
      if (!p.bot) {
        const user = db.users[p.id];
        if (user) {
          user.ryos = Math.max(0, user.ryos + room.rewards[p.id].ryos);
          user.elo = Math.max(100, user.elo + (room.rewards[p.id].elo || 0));
          persist();
        }
      }
    });
    db.matches.unshift({
      id: `m_${Date.now().toString(36)}`,
      type: room.game,
      players: room.state.players.map((p) => ({ id: p.id, name: p.name, score: p.score })),
      detail: { winners: room.state.winners, code: room.code },
      at: Date.now()
    });
    db.matches = db.matches.slice(0, 500);
    persist();
    saveFriendshipOutcome(room);
  }
  broadcast(room);
  scheduleBots(room);
  armRoundTimeout(room);
};

function saveFriendshipOutcome(room) {
  if (room.game !== 'duel') return;
  const [a, b] = room.players;
  if (!a || !b) return;
  const ua = db.users[a.id];
  const ub = db.users[b.id];
  const wonA = room.state.winners.includes(a.id);
  const wonB = room.state.winners.includes(b.id);
  const scoreA = wonA && wonB ? 0.5 : wonA ? 1 : 0;
  const dA = eloDelta(a.elo || 1000, b.elo || 1000, scoreA);
  const dB = eloDelta(b.elo || 1000, a.elo || 1000, 1 - scoreA);
  if (ua) {
    ua.elo = Math.max(100, (ua.elo || 1000) + dA);
    ua.wins = (ua.wins || 0) + (wonA && !wonB ? 1 : 0);
    ua.losses = (ua.losses || 0) + (!wonA && wonB ? 1 : 0);
  }
  if (ub) {
    ub.elo = Math.max(100, (ub.elo || 1000) + dB);
    ub.wins = (ub.wins || 0) + (wonB && !wonA ? 1 : 0);
    ub.losses = (ub.losses || 0) + (!wonB && wonA ? 1 : 0);
  }
  persist();
}

/** Fait jouer les bots a tour de role. */
function scheduleBots(room) {
  if (!room.state || room.state.over || room.botTimer) return;
  if (!currentIsBot(room.state)) return;
  const act = botAction(room.state, 0.58 + Math.random() * 0.2);
  if (!act) return;
  room.botTimer = setTimeout(() => {
    room.botTimer = null;
    applyAction(room, act);
  }, botDelay());
}

/** Chronometre de manche : les joueurs absents perdent la question. */
function armRoundTimeout(room) {
  clearTimeout(room.roundTimer);
  room.roundTimer = null;
  if (!room.state || room.state.over) return;

  // Bataille navale : un joueur absent pendant la phase de tir bloquerait
  // toute la partie, le serveur tire donc a sa place au bout de 20 s.
  if (room.state.phase === 'pick') {
    const pending = room.state.pending && room.state.pending.pick;
    const shooter = pending && room.state.players.find((p) => p.id === pending.playerId);
    const target = pending && room.state.players.find((p) => p.id === pending.targetId);
    if (!shooter || shooter.bot || !target) return;
    room.roundTimer = setTimeout(() => {
      if (!room.state || room.state.over || room.state.phase !== 'pick') return;
      const free = [];
      for (let i = 0; i < 16; i++) if (!target.incoming || !target.incoming[i]) free.push(i);
      if (!free.length) return;
      applyAction(room, { type: 'pick', playerId: shooter.id, payload: free[Math.floor(Math.random() * free.length)] });
    }, 20000);
    return;
  }

  if (room.state.phase !== 'question') return;
  const others = room.state.players.filter((p) => !p.bot);
  if (!others.length) return;
  room.roundTimer = setTimeout(() => {
    const pending = room.state ? room.state.players.filter((p) => !p.answered && p.alive) : [];
    pending.forEach((p) => {
      if (!room.state || room.state.over) return;
      room.state = reduce(room.state, {
        type: 'answer',
        playerId: p.id,
        choice: -1,
        pick: 'pierre'
      });
    });
    broadcast(room);
    scheduleBots(room);
    armRoundTimeout(room);
  }, 40000);
}

function addBotToRoom(room) {
  const botNames = ['Kenji', 'Sakura', 'Tobio', 'Hana', 'Rin', 'Daichi', 'Yuki', 'Haru'];
  const botAvatars = ['🦝', '🐍', '🦔', '🐦', '🐹', '🐗', '🦇', '🐟'];
  const used = room.players.map((p) => p.name);
  const idx = room.players.length;
  const name = botNames.find((n) => !used.includes(n)) || `Ninja ${idx + 1}`;
  room.players.push({
    id: `bot_${room.code}_${idx}`,
    name,
    avatar: botAvatars[idx % botAvatars.length],
    bot: true,
    elo: 1000 + Math.floor(Math.random() * 250),
    ryos: 0,
    grade: 'CE2',
    socketId: null
  });
}

function startRoomGame(socket, room, payload = {}) {
  const questions = (payload.questions && payload.questions.length ? payload.questions : room.questions) || [];
  const engineId = room.game === 'duel' || room.game === 'kahoot' ? 'course' : room.game;
  const maxRounds = payload.maxRounds || (engineId === 'course' ? (room.game === 'duel' ? 8 : 10) : undefined);
  room.state = createGameState(
    engineId,
    room.players.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, bot: p.bot })),
    { questions, maxRounds }
  );
  room.started = true;
  room.state = forceFirstQuestion(room.state);
  io.to(room.code).emit('room:started', { code: room.code, game: room.game });
  broadcast(room);
  scheduleBots(room);
  armRoundTimeout(room);
}

/** Le moteur demarre en phase "lancer" ou "pick" pour certains jeux : on ne force rien. */
function forceFirstQuestion(state) {
  // Le plateau commence par un lancer de de, le Memory par retourner deux cartes.
  if (state.gameId === 'plateau' || state.gameId === 'memory') return state;
  if (state.phase !== 'question' || !state.question) {
    const s = JSON.parse(JSON.stringify(state));
    s.phase = 'question';
    s.question = s.question || s.questions[0] || {
      prompt: 'Combien font 6 + 7 ?',
      choices: ['13', '12', '14', '11'],
      answer: 0,
      explanation: '6 + 7 = 13.'
    };
    return s;
  }
  return state;
}

// --------------------------------- Socket ---------------------------------
io.on('connection', (socket) => {
  socket.on('hello', ({ identity } = {}) => {
    if (!identity || !identity.id) return;
    const user = upsertUser(identity);
    if (!user) return;
    sockets.set(socket.id, user.id);
    online.set(user.id, {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      elo: user.elo,
      ryos: user.ryos,
      grade: user.grade,
      status: 'lobby',
      socketId: socket.id,
      since: Date.now()
    });
    socket.data.playerId = user.id;
    socket.emit('hello:ok', { player: publicUser(user), online: online.size });
    io.emit('presence:list', { count: online.size, list: [...online.values()] });
    persist();
  });

  socket.on('presence:list', () => {
    socket.emit('presence:list', { count: online.size, list: [...online.values()] });
  });

  socket.on('presence:update', ({ status, name, avatar, elo, ryos, grade } = {}) => {
    const id = socket.data.playerId;
    if (!id) return;
    const entry = online.get(id);
    if (entry) {
      if (status) entry.status = status;
      if (name) entry.name = name;
      if (avatar) entry.avatar = avatar;
      if (typeof elo === 'number') entry.elo = elo;
      if (typeof ryos === 'number') entry.ryos = ryos;
      if (grade) entry.grade = grade;
    }
    io.emit('presence:list', { count: online.size, list: [...online.values()] });
  });

  // -------------------------- Demandes d'ami ------------------------------
  socket.on('friends:request', ({ to } = {}) => {
    const from = socket.data.playerId;
    if (!from || !to || from === to) return;
    const exists = db.friendships.find((f) => (f.a === from && f.b === to) || (f.a === to && f.b === from));
    if (exists) exists.status = 'accepted';
    else db.friendships.push({ a: from, b: to, status: 'pending', at: Date.now() });
    persist();
    const targetSocket = [...sockets.entries()].find(([, pid]) => pid === to)?.[0];
    const fromUser = db.users[from];
    if (targetSocket) {
      io.to(targetSocket).emit('friends:requested', { from, name: fromUser?.name || 'Ninja', avatar: fromUser?.avatar || '🦊' });
      socket.emit('toast', { message: `Demande envoyée à ${db.users[to]?.name || 'ce ninja'} !` });
    } else {
      socket.emit('toast', { message: `${db.users[to]?.name || 'Ce ninja'} n’est pas connecté : la demande sera visible plus tard.` });
    }
  });

  socket.on('friends:accept', ({ from } = {}) => {
    const to = socket.data.playerId;
    const rel = db.friendships.find((f) => (f.a === from && f.b === to) || (f.a === to && f.b === from));
    if (rel) {
      rel.status = 'accepted';
      persist();
    }
    const targetSocket = [...sockets.entries()].find(([, pid]) => pid === from)?.[0];
    if (targetSocket) io.to(targetSocket).emit('friends:accepted', { by: to, name: db.users[to]?.name || 'Ninja' });
    socket.emit('friends:accepted', { by: from, name: db.users[from]?.name || 'Ninja' });
  });

  socket.on('friends:list', () => {
    const id = socket.data.playerId;
    if (!id) return;
    const ids = db.friendships.filter((f) => f.a === id || f.b === id).map((f) => (f.a === id ? f.b : f.a));
    const incoming = db.friendships
      .filter((f) => f.b === id && f.status === 'pending')
      .map((f) => ({ id: f.a, name: db.users[f.a]?.name || 'Ninja', avatar: db.users[f.a]?.avatar || '🦊', at: f.at }));
    socket.emit('friends:list', {
      ids,
      incoming,
      friends: ids.map((fid) => ({ ...publicUser(db.users[fid] || { id: fid, name: 'Ninja', avatar: '🦊' }), online: online.has(fid) }))
    });
  });

  // ------------------------------- Chat ----------------------------------
  socket.on('chat:send', ({ to, text } = {}) => {
    const from = socket.data.playerId;
    if (!from || !text) return;
    const msg = { id: `c_${Date.now()}`, from, to: to || 'world', text: String(text).slice(0, 240), at: Date.now(), name: db.users[from]?.name || 'Ninja' };
    db.chat.unshift(msg);
    db.chat = db.chat.slice(0, 300);
    persist();
    if (to) {
      const targetSocket = [...sockets.entries()].find(([, pid]) => pid === to)?.[0];
      socket.emit('chat:message', msg);
      if (targetSocket) io.to(targetSocket).emit('chat:message', msg);
    } else {
      io.emit('chat:message', msg);
    }
  });

  // --------------------------- Duels classes ------------------------------
  socket.on('duel:invite', ({ to, questions, maxRounds } = {}) => {
    const from = socket.data.playerId;
    if (!from || !to) return;
    const me = online.get(from);
    const targetSocket = [...sockets.entries()].find(([, pid]) => pid === to)?.[0];
    if (!targetSocket) {
      socket.emit('toast', { message: 'Ce ninja n’est pas connecté pour le moment.' });
      return;
    }
    const code = makeCode();
    const room = newRoom('duel', { id: from }, { questions, code });
    room.duel = { from, to, questions, maxRounds: maxRounds || 8 };
    room.players.push({
      id: from,
      name: me?.name || 'Ninja',
      avatar: me?.avatar || '🦊',
      elo: me?.elo || 1000,
      ryos: me?.ryos || 0,
      grade: me?.grade || 'CE2',
      socketId: socket.id
    });
    socket.join(code);
    io.to(targetSocket).emit('duel:invited', {
      code,
      from,
      name: me?.name || 'Ninja',
      avatar: me?.avatar || '🦊',
      elo: me?.elo || 1000
    });
    socket.emit('duel:waiting', { code, opponent: db.users[to]?.name || 'Ninja' });
  });

  socket.on('duel:accept', ({ code } = {}) => {
    const id = socket.data.playerId;
    const room = rooms.get(code);
    if (!room || !room.duel) {
      socket.emit('toast', { message: 'Ce duel n’est plus disponible.' });
      return;
    }
    if (room.duel.to !== id) return;
    const me = online.get(id);
    room.players.push({
      id,
      name: me?.name || 'Ninja',
      avatar: me?.avatar || '🦊',
      elo: me?.elo || 1000,
      ryos: me?.ryos || 0,
      grade: me?.grade || 'CE2',
      socketId: socket.id
    });
    socket.join(code);
    io.to(room.code).emit('duel:ready', { code });
    startRoomGame(socket, room, { questions: room.duel.questions, maxRounds: room.duel.maxRounds });
  });

  socket.on('duel:cancel', ({ code } = {}) => {
    const room = rooms.get(code);
    if (!room) return;
    io.to(room.code).emit('room:closed', { reason: 'annule' });
    rooms.delete(code);
  });

  // ------------------------------ Salons ---------------------------------
  socket.on('room:create', ({ game, questions, options, botFill = true, maxPlayers = 4 } = {}) => {
    const id = socket.data.playerId || `guest_${socket.id}`;
    const me = online.get(id);
    const room = newRoom(game || 'plateau', { id }, { questions, options });
    room.players.push({
      id,
      name: me?.name || 'Ninja',
      avatar: me?.avatar || '🦊',
      elo: me?.elo || 1000,
      ryos: me?.ryos || 0,
      grade: me?.grade || 'CE2',
      socketId: socket.id
    });
    socket.join(room.code);
    socket.data.roomCode = room.code;
    if (me) {
      me.status = 'playing';
      io.emit('presence:list', { count: online.size, list: [...online.values()] });
    }
    if (botFill) {
      const min = game === 'morpion' || game === 'loto' || game === 'boss' || game === 'kunai' ? 3 : 3;
      while (room.players.length < Math.min(maxPlayers, min + 1)) addBotToRoom(room);
    }
    socket.emit('room:created', { code: room.code, game: room.game });
    broadcast(room);
  });

  socket.on('room:join', ({ code } = {}) => {
    const id = socket.data.playerId || `guest_${socket.id}`;
    const me = online.get(id);
    const room = rooms.get(String(code || '').toUpperCase());
    if (!room) {
      socket.emit('toast', { message: 'Aucun salon avec ce code. Vérifie le PIN !' });
      return;
    }
    if (room.started) {
      socket.join(room.code);
      socket.emit('toast', { message: 'La partie a déjà commencé : tu regardes en spectateur.' });
      broadcast(room);
      return;
    }
    if (room.players.length >= (room.game === 'duel' ? 2 : 6)) {
      socket.emit('toast', { message: 'Le salon est complet.' });
      return;
    }
    if (!room.players.some((p) => p.id === id)) {
      room.players.push({
        id,
        name: me?.name || 'Ninja',
        avatar: me?.avatar || '🦊',
        elo: me?.elo || 1000,
        ryos: me?.ryos || 0,
        grade: me?.grade || 'CE2',
        socketId: socket.id
      });
    } else {
      const p = room.players.find((x) => x.id === id);
      p.socketId = socket.id;
    }
    socket.join(room.code);
    socket.data.roomCode = room.code;
    if (me) me.status = 'playing';
    socket.emit('room:joined', { code: room.code, game: room.game });
    broadcast(room);
    if (room.started) socket.emit('room:started', { code: room.code, game: room.game });
  });

  socket.on('room:addBot', ({ code } = {}) => {
    const room = rooms.get(code || socket.data.roomCode);
    if (!room || room.started || room.players.length >= 6) return;
    addBotToRoom(room);
    broadcast(room);
  });

  socket.on('room:kick', ({ code, playerId } = {}) => {
    const room = rooms.get(code || socket.data.roomCode);
    if (!room || room.hostId !== socket.data.playerId) return;
    room.players = room.players.filter((p) => p.id !== playerId);
    broadcast(room);
  });

  socket.on('room:start', ({ code, questions, maxRounds } = {}) => {
    const room = rooms.get(code || socket.data.roomCode);
    if (!room) return;
    if (room.hostId !== socket.data.playerId) {
      socket.emit('toast', { message: 'Seul l’hôte peut lancer la partie.' });
      return;
    }
    if (questions && questions.length) room.questions = questions;
    startRoomGame(socket, room, { questions: room.questions, maxRounds });
  });

  socket.on('room:action', ({ code, action } = {}) => {
    const room = rooms.get(code || socket.data.roomCode);
    if (!room || !room.state) return;
    const id = socket.data.playerId;
    const isSeat = room.players.some((p) => p.id === id && !p.bot);
    if (!isSeat) return;
    const act = { ...(action || {}), playerId: id };
    applyAction(room, act);
  });

  /** L'hote peut passer une question sans attendre tout le monde. */
  socket.on('room:forceNext', ({ code } = {}) => {
    const room = rooms.get(code || socket.data.roomCode);
    if (!room || !room.state || room.state.over) return;
    if (room.hostId !== socket.data.playerId) return;
    const pending = room.state.players.filter((p) => !p.answered && p.alive);
    pending.forEach((p) => {
      if (!room.state || room.state.over) return;
      room.state = reduce(room.state, { type: 'answer', playerId: p.id, choice: -1, pick: 'ciseaux' });
    });
    broadcast(room);
    scheduleBots(room);
  });

  socket.on('room:chat', ({ code, text } = {}) => {
    const room = rooms.get(code || socket.data.roomCode);
    const id = socket.data.playerId;
    if (!room || !text) return;
    const msg = { id: `r_${Date.now()}`, from: id, name: db.users[id]?.name || online.get(id)?.name || 'Ninja', text: String(text).slice(0, 200), at: Date.now() };
    room.chat.unshift(msg);
    io.to(room.code).emit('room:chat', msg);
  });

  socket.on('room:leave', ({ code } = {}) => {
    const room = rooms.get(code || socket.data.roomCode);
    const id = socket.data.playerId;
    if (!room) return;
    socket.leave(room.code);
    socket.data.roomCode = null;
    const p = room.players.find((x) => x.id === id);
    if (p) {
      if (room.started) {
        // Le joueur part : un bot prend le relais pour ne pas bloquer la partie.
        p.bot = true;
        p.socketId = null;
        broadcast(room);
        scheduleBots(room);
      } else {
        room.players = room.players.filter((x) => x.id !== id);
        broadcast(room);
      }
    }
    const me = online.get(id);
    if (me) {
      me.status = 'lobby';
      io.emit('presence:list', { count: online.size, list: [...online.values()] });
    }
    if (!room.players.filter((x) => !x.bot).length) {
      clearTimers(room);
      rooms.delete(room.code);
    }
  });

  /** Salons publics : "rejoindre une partie en cours". */
  socket.on('rooms:list', () => {
    const list = [...rooms.values()]
      .filter((r) => !r.state?.over)
      .map((r) => ({
        code: r.code,
        game: r.game,
        players: r.players.filter((p) => !p.bot).length,
        started: r.started,
        host: r.players.find((p) => p.id === r.hostId)?.name || 'Ninja'
      }));
    socket.emit('rooms:list', { list });
  });

  socket.on('disconnect', () => {
    const id = sockets.get(socket.id);
    sockets.delete(socket.id);
    if (id) {
      const stillConnected = [...sockets.values()].includes(id);
      if (!stillConnected) {
        online.delete(id);
        io.emit('presence:list', { count: online.size, list: [...online.values()] });
      }
      const roomCode = socket.data.roomCode;
      const room = roomCode ? rooms.get(roomCode) : null;
      if (room) {
        const p = room.players.find((x) => x.id === id);
        if (p && room.started) {
          p.bot = true;
          p.socketId = null;
          broadcast(room);
          scheduleBots(room);
        }
      }
    }
    io.emit('presence:list', { count: online.size, list: [...online.values()] });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🍥  Academie Ninja — serveur en ligne sur http://0.0.0.0:${PORT}`);
  console.log(`      REST : /api/health · Socket.IO : /socket.io`);
  if (fs.existsSync(DIST_DIR)) console.log('      Interface web servie depuis /dist');
  console.log('');
});

process.on('SIGTERM', () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db));
  } catch {
    /* ignore */
  }
  process.exit(0);
});
