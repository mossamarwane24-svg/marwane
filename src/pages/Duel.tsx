import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../state/GameContext';
import { usePartyRoom } from '../hooks/usePartyRoom';
import { buildPartyQuestions } from '../data/questions';
import { GameStage } from '../components/games';
import { GameOverPanel } from '../components/party';
import { Modal, SectionTitle, StatBox } from '../components/ui';
import { ELO_TIERS, eloTier } from '../data/ranks';
import { cx, formatRyos } from '../lib/format';
import { gradeLabel } from '../data/grades';
import { netEmit, onNet } from '../state/net';
import type { NetPlayer } from '../types';
import { sfx } from '../lib/sound';

export const DuelPage: React.FC = () => {
  const { profile, save, recordGame, toast, onlinePlayers, netStatus } = useGame();
  const [mode, setMode] = useState<'online' | 'local'>('online');
  const [phase, setPhase] = useState<'home' | 'play'>('home');
  const [invites, setInvites] = useState<{ code: string; from: string; name: string; avatar: string; elo: number }[]>([]);
  const [waiting, setWaiting] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<string>('');
  const recorded = useRef(false);

  const questions = useMemo(() => buildPartyQuestions(profile.grade, profile.difficulty, 12), [profile.grade, profile.difficulty]);

  const room = usePartyRoom({ game: 'duel', questions, mode, botCount: 1, autoCreate: false, botFill: false });
  const tier = eloTier(profile.elo);
  const nextTier = ELO_TIERS.find((t) => t.min > profile.elo);

  useEffect(() => {
    const offInvite = onNet<any>('duel:invited', (p) => {
      setInvites((prev) => [p, ...prev.filter((i) => i.code !== p.code)]);
      sfx.correct();
      toast(`${p.name} te défie en duel !`, 'info', '⚔️');
    });
    const offReady = onNet<any>('duel:ready', () => {
      setWaiting(null);
      setPhase('play');
    });
    const offWaiting = onNet<any>('duel:waiting', (p) => setWaiting(p.code));
    return () => {
      offInvite();
      offReady();
      offWaiting();
    };
  }, [toast]);

  useEffect(() => {
    if (room.status === 'playing' || room.status === 'over') setPhase('play');
  }, [room.status]);

  useEffect(() => {
    if (room.status !== 'over' || !room.state || recorded.current) return;
    recorded.current = true;
    const me = room.state.players.find((p) => p.id === room.youId);
    if (!me) return;
    const rewards = room.rewards?.[room.youId];
    recordGame({
      type: 'duel',
      label: `Duel classé vs ${opponent || 'adversaire'}`,
      correct: me.correct,
      total: Math.max(1, me.correct + me.wrong),
      baseRyos: rewards?.ryos ?? 40 + me.correct * 12,
      eloDelta: rewards?.elo ?? 0,
      duelWon: !!rewards?.won,
      opponent: opponent || 'adversaire'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.status, room.state]);

  const challenge = (player: NetPlayer) => {
    if (netStatus !== 'online') {
      toast('Passe en mode bots : le serveur en ligne n’est pas joignable.', 'error', '🔌');
      return;
    }
    netEmit('duel:invite', { to: player.id, questions, maxRounds: 8 });
    setOpponent(player.name);
    setWaiting('…');
    toast(`Invitation de duel envoyée à ${player.name}`, 'info', '⚔️');
  };

  const acceptInvite = (invite: { code: string; from: string; name: string }) => {
    netEmit('duel:accept', { code: invite.code });
    setOpponent(invite.name);
    setInvites([]);
    setPhase('play');
  };

  const startBotDuel = () => {
    setMode('local');
    setOpponent('Bot Sensei');
    recorded.current = false;
    setTimeout(() => room.actions.start(), 50);
    setPhase('play');
  };

  // --------------------------------- En duel --------------------------------
  if (phase === 'play') {
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="h1">⚔️ Duel {opponent ? `vs ${opponent}` : ''}</h1>
          <div className="flex items-center gap-2">
            <span className="chip">{tier.emoji} {profile.elo} ELO</span>
            <button
              className="btn-ghost"
              onClick={() => {
                room.actions.leave();
                recorded.current = false;
                setPhase('home');
                setWaiting(null);
              }}
            >
              🚪 Quitter
            </button>
          </div>
        </div>

        {!room.state && (
          <div className="card text-center">
            <div className="text-4xl floaty">🕐</div>
            <p className="mt-2 font-bold">En attente de l’adversaire…</p>
            <p className="text-sm text-ninja-muted">Dès qu’il accepte, le duel commence automatiquement.</p>
          </div>
        )}

        {room.state && room.status !== 'over' && <GameStage room={room} gameId="duel" />}

        {room.status === 'over' && (
          <GameOverPanel
            ranking={room.finalRanking}
            rewards={room.rewards}
            youId={room.youId}
            title="Duel terminé"
            onReplay={() => {
              recorded.current = false;
              room.actions.recreate(buildPartyQuestions(profile.grade, profile.difficulty, 12));
            }}
            onExit={() => {
              recorded.current = false;
              setPhase('home');
            }}
          />
        )}
      </div>
    );
  }

  // --------------------------------- Accueil --------------------------------
  return (
    <div className="grid gap-4">
      <Modal open={invites.length > 0} title="⚔️ Défi reçu !">
        {invites.map((i) => (
          <div key={i.code} className="mb-3 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{i.avatar}</span>
              <div className="flex-1">
                <div className="font-black">{i.name}</div>
                <div className="text-xs text-ninja-muted">ELO {i.elo} · 8 questions</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="btn-primary flex-1" onClick={() => acceptInvite(i)}>
                ✅ Accepter
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  netEmit('duel:cancel', { code: i.code });
                  setInvites((prev) => prev.filter((x) => x.code !== i.code));
                }}
              >
                Refuser
              </button>
            </div>
          </div>
        ))}
      </Modal>

      <div className="card">
        <h1 className="h1">⚔️ Duels classés</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Affronte un autre ninja sur 8 questions. Le gagnant gagne ~10 ELO, le perdant en perd. Chaque duel rapporte des Ryos selon tes
          bonnes réponses.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon="🏅" label="ELO" value={profile.elo} hint={tier.name} />
          <StatBox icon="🏆" label="Duels gagnés" value={save.stats.duelsWon} />
          <StatBox icon="📉" label="Duels joués" value={save.stats.duelsPlayed} />
          <StatBox icon="🪙" label="Ryos" value={formatRyos(profile.ryos)} />
        </div>
        {nextTier && (
          <p className="mt-3 text-xs text-ninja-muted">
            Prochaine ligue : {nextTier.emoji} <b>{nextTier.name}</b> à {nextTier.min} ELO.
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <SectionTitle
            icon="🌐"
            title="Ninjas en ligne"
            subtitle={netStatus === 'online' ? `${onlinePlayers.length} joueur(s) connecté(s)` : 'Serveur hors ligne'}
          />
          {onlinePlayers.filter((p) => p.id !== profile.id).length === 0 ? (
            <div className="grid gap-3">
              <p className="text-sm text-ninja-muted">
                Personne d’autre n’est connecté pour le moment. Pas de souci : affronte un bot entraîné, ou va chercher des amis dans
                l’onglet Amis.
              </p>
              <button className="btn-primary" onClick={startBotDuel}>
                🤖 Duel contre un bot
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              {onlinePlayers
                .filter((p) => p.id !== profile.id)
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-3">
                    <span className="text-2xl">{p.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold">{p.name}</div>
                      <div className="text-[11px] text-ninja-muted">
                        {gradeLabel(p.grade as never) || p.grade} · ELO {p.elo} · {p.ryos} Ryos
                      </div>
                    </div>
                    <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => challenge(p)}>
                      ⚔️ Défier
                    </button>
                  </div>
                ))}
              <button className="btn-ghost mt-1" onClick={startBotDuel}>
                🤖 Ou défier un bot
              </button>
            </div>
          )}
          {waiting && (
            <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm">
              ⏳ En attente de la réponse de <b>{opponent}</b>… <span className="text-ninja-muted">(invitation envoyée)</span>
            </div>
          )}
        </div>

        <div className="grid content-start gap-4">
          <div className="card">
            <div className="label">Ligues ELO</div>
            <div className="grid gap-1 text-sm">
              {ELO_TIERS.map((t) => (
                <div key={t.name} className={cx('flex justify-between rounded-lg px-2 py-1', profile.elo >= t.min ? 'bg-amber-500/15 text-amber-200' : 'text-ninja-muted')}>
                  <span>
                    {t.emoji} {t.name}
                  </span>
                  <span>{t.min}+</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card text-xs text-ninja-muted">
            <div className="label">Comment jouer en ligne ?</div>
            1. Lance le serveur : <code className="text-amber-200">npm run server</code> (ou <code className="text-amber-200">npm run dev</code>).
            <br />
            2. Ouvre le site sur deux appareils connectés à la même adresse.
            <br />
            3. Tu vois les ninjas connectés ici : envoie un défi !
          </div>
        </div>
      </div>
    </div>
  );
};
