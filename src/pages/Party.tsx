import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../state/GameContext';
import { usePartyRoom } from '../hooks/usePartyRoom';
import { buildPartyQuestions } from '../data/questions';
import { PARTY_GAMES, partyGameById } from '../data/partyGames';
import { GameStage } from '../components/games';
import { GameOverPanel } from '../components/party';
import { SectionTitle, Tabs } from '../components/ui';
import { cx, formatRyos, randCode } from '../lib/format';
import { netEmit, onNet } from '../state/net';
import type { PartyGameId } from '../types';
import { sfx } from '../lib/sound';

type Phase = 'pick' | 'lobby' | 'play';

export const PartyPage: React.FC = () => {
  const { profile, save, recordGame, toast, netStatus, onlinePlayers } = useGame();
  const [phase, setPhase] = useState<Phase>('pick');
  const [gameId, setGameId] = useState<PartyGameId>('plateau');
  const [mode, setMode] = useState<'online' | 'local'>('local');
  const [joinCode, setJoinCode] = useState('');
  const [rooms, setRooms] = useState<{ code: string; game: string; players: number; started: boolean; host: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [remixKey, setRemixKey] = useState(0);
  const [tab, setTab] = useState<'games' | 'rules'>('games');
  const recorded = useRef(false);
  const [params] = useSearchParams();

  const questions = useMemo(
    () => buildPartyQuestions(profile.grade, profile.difficulty, 24),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile.grade, profile.difficulty, gameId, remixKey]
  );

  const room = usePartyRoom({
    game: gameId,
    questions,
    mode,
    botCount: 3,
    botFill: false
  });

  const info = partyGameById(gameId);

  // Lien recu d'un ami : ?code=ABCDEF ou ?game=plateau
  useEffect(() => {
    const code = params.get('code');
    const wanted = params.get('game') as PartyGameId | null;
    if (wanted && PARTY_GAMES.some((g) => g.id === wanted)) setGameId(wanted);
    if (code) {
      setJoinCode(code.toUpperCase());
      toast(`Salon ${code.toUpperCase()} : appuie sur « Rejoindre » pour entrer !`, 'info', '🔗');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Liste des salons ouverts
  useEffect(() => {
    if (phase !== 'lobby' || mode !== 'online') return;
    netEmit('rooms:list');
    const off = onNet<{ list: typeof rooms }>('rooms:list', (p) => setRooms(p.list || []));
    const t = setInterval(() => netEmit('rooms:list'), 8000);
    return () => {
      off();
      clearInterval(t);
    };
  }, [phase, mode]);

  // Synchronise l'etat du salon avec la phase de la page
  useEffect(() => {
    if (room.status === 'playing' || room.status === 'over') setPhase('play');
  }, [room.status]);

  // Enregistrement du resultat
  useEffect(() => {
    if (room.status !== 'over' || !room.state || recorded.current) return;
    recorded.current = true;
    const me = room.state.players.find((p) => p.id === room.youId);
    if (!me) return;
    const rewards = room.rewards?.[room.youId];
    const won = !!rewards?.won;
    recordGame({
      type: 'party',
      label: `${info.name} (${room.state.players.length} joueurs)`,
      correct: me.correct,
      total: Math.max(1, me.correct + me.wrong),
      baseRyos: rewards?.ryos ?? 30 + me.correct * 10,
      eloDelta: rewards?.elo ?? 0,
      party: true,
      partyWin: won,
      teamWin: gameId === 'equipe' && won,
      batailleWin: gameId === 'bataille' && won,
      memoryWin: gameId === 'memory' && won,
      p4Win: gameId === 'puissance4' && won,
      boardWin: gameId === 'plateau' && won,
      opponent: room.state.players.filter((p) => p.id !== room.youId).map((p) => p.name).join(', ')
    });
    if (won) sfx.win();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.status, room.state]);

  // -------------------------------- Choix du jeu ---------------------------
  if (phase === 'pick') {
    return (
      <div className="grid gap-4">
        <div className="card">
          <h1 className="h1">🎲 Jeux à 4 joueurs</h1>
          <p className="mt-1 text-sm text-ninja-muted">
            10 jeux de plateau, de questions, d’équipes, de mémoire, de bataille navale et de Puissance 4, jouables jusqu’à 4 ninjas (ou plus en spectateur). En ligne avec tes amis via un
            code, ou tout de suite contre des bots. Toutes les parties rapportent des Ryos et font monter ton ELO.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip">🎲 Dé et plateau</span>
            <span className="chip">🛡️ Bataille d’équipes 2 vs 2</span>
            <span className="chip">🌊 Bataille navale 1 vs 1</span>
            <span className="chip">🧠 Memory des Ninjas</span>
            <span className="chip">🔴 Puissance 4 des Ninjas</span>
            <span className="chip">🧠 Questions de ton niveau</span>
            <span className="chip">🪙 Ryos en jeu</span>
            <span className="chip">📡 {netStatus === 'online' ? 'Serveur en ligne' : 'Mode bots hors ligne'}</span>
          </div>
        </div>

        <Tabs
          tabs={[
            { id: 'games', label: 'Choisir un jeu', icon: '🎮' },
            { id: 'rules', label: 'Comment jouer', icon: '📖' }
          ]}
          value={tab}
          onChange={(v) => setTab(v as 'games' | 'rules')}
        />

        {tab === 'games' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PARTY_GAMES.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setGameId(g.id);
                  sfx.click();
                }}
                className={cx(
                  'rounded-2xl border p-4 text-left transition',
                  gameId === g.id ? 'border-amber-400/80 bg-amber-500/10' : 'border-ninja-line bg-ninja-panel/70 hover:border-amber-400/40'
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{g.emoji}</span>
                  <span className="chip">{g.minPlayers}-{g.maxPlayers} joueurs</span>
                </div>
                <div className="mt-2 font-black">{g.name}</div>
                <div className="text-xs text-ninja-muted">{g.desc}</div>
                <div className="mt-2 text-[11px] text-amber-300">{g.tag}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="card">
            <SectionTitle icon="📖" title={`Règles : ${info.name}`} subtitle={info.desc} />
            <ol className="grid gap-2 text-sm">
              {info.rules.map((r, i) => (
                <li key={r} className="flex gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-3">
                  <span className="font-black text-amber-300">{i + 1}.</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="card">
          <SectionTitle icon="🚀" title="Lancer la partie" subtitle={`${info.name} · ${info.minPlayers} à ${info.maxPlayers} joueurs`} />
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="btn-primary !py-3"
              onClick={() => {
                setMode('online');
                setPhase('lobby');
              }}
              disabled={netStatus !== 'online'}
              title={netStatus !== 'online' ? 'Serveur en ligne indisponible' : undefined}
            >
              📡 Jouer en ligne avec des amis
            </button>
            <button
              className="btn-green !py-3"
              onClick={() => {
                setMode('local');
                setPhase('lobby');
              }}
            >
              🤖 Jouer tout de suite (bots)
            </button>
          </div>
          {netStatus !== 'online' && (
            <p className="mt-2 text-xs text-ninja-muted">
              Le mode en ligne nécessite le serveur temps réel (npm run server). Le mode bots fonctionne toujours, même publié en
              statique.
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <div className="min-w-[180px] flex-1">
              <label className="label">Rejoindre avec un code de salon</label>
              <input
                className="input uppercase"
                placeholder="Ex : K7X2QB"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
            </div>
            <button
              className="btn-blue"
              onClick={() => {
                if (joinCode.length < 4) {
                  toast('Entre un code de salon valide.', 'error', '🔑');
                  return;
                }
                setMode('online');
                setPhase('lobby');
                room.actions.joinRoom(joinCode);
              }}
            >
              🔑 Rejoindre
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------- Lobby --------------------------------
  if (phase === 'lobby') {
    const players = room.lobby.length ? room.lobby : [{ id: profile.id, name: profile.name, avatar: profile.avatar }];
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid content-start gap-4">
          <div className="card">
            <SectionTitle
              icon={info.emoji}
              title={`Salon ${info.name}`}
              subtitle={mode === 'online' ? 'Partage le code pour inviter tes amis' : 'Mode local : tu joues contre des bots'}
              right={
                <span className={cx('chip', mode === 'online' ? '!border-emerald-400/50 !text-emerald-200' : '')}>
                  {mode === 'online' ? '📡 en ligne' : '🤖 bots'}
                </span>
              }
            />
            {mode === 'online' && (
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-amber-400/50 bg-amber-500/10 px-4 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-ninja-muted">Code du salon</div>
                  <div className="text-2xl font-black tracking-[0.3em] text-amber-200">{room.code || '·····'}</div>
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    navigator.clipboard?.writeText(`${window.location.origin}/party?code=${room.code}`);
                    toast('Lien du salon copié !', 'success', '🔗');
                  }}
                >
                  🔗 Copier le lien
                </button>
                <span className="chip">{onlinePlayers.length} ninja(s) en ligne</span>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/50 p-3">
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">
                      {p.name} {p.id === room.youId && <span className="text-[10px] text-amber-300">toi</span>}
                    </div>
                    <div className="text-[11px] text-ninja-muted">
                      {p.bot ? 'bot entraîné' : `ELO ${p.elo ?? 1000}`}
                      {p.id === room.lobby[0]?.id && players.length > 1 ? ' · hôte' : ''}
                    </div>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, info.maxPlayers - players.length) }, (_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-2 rounded-xl border border-dashed border-ninja-line p-3 text-ninja-muted">
                  <span className="text-2xl opacity-40">👤</span>
                  <span className="text-sm">Place libre {players.length + i + 1}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={room.actions.start} disabled={mode === 'online' && !room.code}>
                {mode === 'online' ? '🚀 Lancer la partie' : '🚀 Lancer la partie (bots)'}
              </button>
              <button className="btn-ghost" onClick={room.actions.addBot} disabled={players.length >= info.maxPlayers}>
                ➕ Ajouter un bot
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setRemixKey((k) => k + 1);
                  toast('Nouvelles questions préparées !', 'info', '🔄');
                }}
              >
                🔄 Nouvelles questions
              </button>
              <button className="btn-ghost" onClick={() => setPhase('pick')}>
                ← Changer de jeu
              </button>
            </div>
            {room.error && <p className="mt-2 text-xs text-red-300">⚠️ {room.error}</p>}
          </div>

          {mode === 'online' && (
            <div className="card">
              <SectionTitle icon="📋" title="Salons ouverts" subtitle="Rejoins une partie publique en un clic" />
              {rooms.length === 0 ? (
                <p className="text-sm text-ninja-muted">Aucun salon ouvert pour le moment. Crée le tien et partage le code !</p>
              ) : (
                <div className="grid gap-2">
                  {rooms.map((r) => (
                    <div key={r.code} className="flex items-center gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-2 text-sm">
                      <span className="font-black tracking-widest text-amber-200">{r.code}</span>
                      <span className="flex-1 truncate text-ninja-muted">
                        {partyGameById(r.game as PartyGameId)?.name || r.game} · hôte {r.host} · {r.players} joueur(s)
                        {r.started ? ' · en cours' : ''}
                      </span>
                      <button className="btn-ghost !px-3 !py-1 text-xs" onClick={() => room.actions.joinRoom(r.code)}>
                        Rejoindre
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid content-start gap-4">
          <div className="card">
            <div className="label">Tchat du salon</div>
            <div className="mb-2 grid max-h-60 gap-1 overflow-y-auto">
              {room.chat.length === 0 && <p className="text-xs text-ninja-muted">Dis bonjour à tes adversaires ! 👋</p>}
              {room.chat.map((m) => (
                <div key={m.id} className="rounded-lg border border-ninja-line bg-ninja-panel2/40 px-2 py-1 text-xs">
                  <b className="text-amber-200">{m.name}</b> : {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input !py-2 text-sm"
                placeholder="Message…"
                value={chatInput}
                maxLength={140}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    room.actions.sendChat(chatInput);
                    setChatInput('');
                  }
                }}
              />
              <button
                className="btn-ghost !px-3"
                onClick={() => {
                  room.actions.sendChat(chatInput);
                  setChatInput('');
                }}
              >
                ➤
              </button>
            </div>
          </div>

          <div className="card">
            <div className="label">Règles express</div>
            <ul className="grid gap-1 text-xs text-ninja-muted">
              {info.rules.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------- Partie -------------------------------
  const over = room.status === 'over';
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="h1">
          {info.emoji} {info.name}
        </h1>
        <div className="flex items-center gap-2">
          {room.code && <span className="chip !tracking-widest">PIN {room.code}</span>}
          <span className="chip">🪙 {formatRyos(profile.ryos)}</span>
          <button
            className="btn-ghost"
            onClick={() => {
              room.actions.leave();
              recorded.current = false;
              setPhase('pick');
            }}
          >
            🚪 Quitter
          </button>
        </div>
      </div>

      {over ? (
        <GameOverPanel
          ranking={room.finalRanking}
          rewards={room.rewards}
          youId={room.youId}
          title={`${info.name} terminé`}
          onReplay={() => {
            recorded.current = false;
            setRemixKey((k) => k + 1);
            room.actions.recreate(buildPartyQuestions(profile.grade, profile.difficulty, 24));
          }}
        />
      ) : (
        <GameStage room={room} gameId={gameId} hostControls={mode === 'online'} />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card">
          <div className="label">Tchat</div>
          <div className="mb-2 grid max-h-40 gap-1 overflow-y-auto">
            {room.chat.map((m) => (
              <div key={m.id} className="text-xs">
                <b className="text-amber-200">{m.name}</b> : {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input !py-2 text-sm"
              placeholder="Message…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  room.actions.sendChat(chatInput);
                  setChatInput('');
                }
              }}
            />
            <button
              className="btn-ghost !px-3"
              onClick={() => {
                room.actions.sendChat(chatInput);
                setChatInput('');
              }}
            >
              ➤
            </button>
          </div>
        </div>
        <div className="card text-xs text-ninja-muted">
          <div className="label">Astuce</div>
          {mode === 'online'
            ? 'Les joueurs qui quittent sont remplacés par un bot pour ne bloquer personne. L’hôte peut passer une question.'
            : 'Mode bots : parfait pour s’entraîner hors ligne. Passe en ligne pour jouer avec de vrais ninjas !'}
          <div className="mt-2">
            Mon grade : {save.profile.grade} · ELO {profile.elo} · Ryos {formatRyos(profile.ryos)}
          </div>
          <button className="btn-ghost mt-3" onClick={() => setRemixKey((k) => k + 1)}>
            🔄 Préparer d’autres questions ({randCode(4)})
          </button>
        </div>
      </div>
    </div>
  );
};
