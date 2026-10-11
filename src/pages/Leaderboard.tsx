import React, { useCallback, useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { api, type PublicUserRow } from '../lib/api';
import { SectionTitle, StatBox, Tabs } from '../components/ui';
import { cx, formatRyos } from '../lib/format';
import { rankFromRyos } from '../data/ranks';
import { gradeLabel } from '../data/grades';

type Metric = 'ryos' | 'elo' | 'streak' | 'wins';

const METRIC_LABEL: Record<Metric, string> = {
  ryos: 'Ryos',
  elo: 'ELO',
  streak: 'Série de jours',
  wins: 'Duels gagnés'
};

export const LeaderboardPage: React.FC = () => {
  const { profile, netStatus, onlineCount, toast } = useGame();
  const [metric, setMetric] = useState<Metric>('ryos');
  const [list, setList] = useState<PublicUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(
    async (m: Metric) => {
      setLoading(true);
      const rows = await api.leaderboard(m, 50);
      const me: PublicUserRow = {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        grade: profile.grade,
        elo: profile.elo,
        ryos: profile.ryos,
        streak: 1,
        online: true
      };
      const merged = [...rows.filter((r) => r.id !== profile.id), me].map((r) => ({
        ...r,
        ryos: r.id === profile.id ? profile.ryos : r.ryos,
        elo: r.id === profile.id ? profile.elo : r.elo
      }));
      merged.sort((a, b) => Number((b as unknown as Record<string, number>)[metric] || 0) - Number((a as unknown as Record<string, number>)[metric] || 0));
      setList(merged.map((r, i) => ({ ...r, rank: i + 1 })));
      setLoading(false);
      if (!rows.length) toast('Classement local affiché (serveur hors ligne)', 'info', '🏆');
    },
    [metric, profile, toast]
  );

  useEffect(() => {
    void load(metric);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric]);

  const filtered = list.filter((r) => r.name.toLowerCase().includes(query.trim().toLowerCase()));
  const myRow = list.find((r) => r.id === profile.id);

  return (
    <div className="grid gap-5">
      <div className="card">
        <h1 className="h1">🏆 Classement mondial</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Compare-toi aux autres ninjas de l’Académie. Le classement mélange les profils du serveur et les joueurs de référence :{' '}
          {netStatus === 'online' ? `${onlineCount} joueur(s) en ligne maintenant` : 'serveur hors ligne (classement local)'}.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon="📍" label="Ta position" value={myRow ? `#${myRow.rank}` : '—'} />
          <StatBox icon="🪙" label="Tes Ryos" value={formatRyos(profile.ryos)} />
          <StatBox icon="🏅" label="Ton ELO" value={profile.elo} />
          <StatBox icon="🍥" label="Ton grade" value={rankFromRyos(profile.ryos).name} />
        </div>
      </div>

      <div>
        <Tabs
          tabs={[
            { id: 'ryos', label: 'Ryos', icon: '🪙' },
            { id: 'elo', label: 'ELO', icon: '🏅' },
            { id: 'streak', label: 'Séries', icon: '🔥' },
            { id: 'wins', label: 'Duels gagnés', icon: '⚔️' }
          ]}
          value={metric}
          onChange={(v) => setMetric(v as Metric)}
        />

        <div className="card">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              className="input max-w-xs"
              placeholder="Rechercher un joueur…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn-ghost" onClick={() => load(metric)} disabled={loading}>
              🔄 Actualiser
            </button>
            <span className="chip">{METRIC_LABEL[metric]}</span>
            {loading && <span className="text-xs text-ninja-muted">chargement…</span>}
          </div>

          <div className="grid gap-2">
            <div className="hidden grid-cols-[40px_1fr_80px_90px_80px_70px] gap-2 px-2 text-[11px] font-black uppercase tracking-widest text-ninja-muted sm:grid">
              <span>#</span>
              <span>Joueur</span>
              <span>Classe</span>
              <span className="text-right">Ryos</span>
              <span className="text-right">ELO</span>
              <span className="text-right">Série</span>
            </div>
            {filtered.map((r) => (
              <div
                key={r.id}
                className={cx(
                  'grid grid-cols-[40px_1fr_auto] items-center gap-2 rounded-xl border p-2 text-sm sm:grid-cols-[40px_1fr_80px_90px_80px_70px]',
                  r.id === profile.id ? 'border-amber-400/60 bg-amber-500/15' : 'border-ninja-line bg-ninja-panel2/40'
                )}
              >
                <span className={cx('text-center font-black', r.rank === 1 && 'text-amber-300', r.rank === 2 && 'text-slate-300', r.rank === 3 && 'text-orange-300')}>
                  {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="text-xl">{r.avatar}</span>
                  <span className="truncate font-bold">{r.name}</span>
                  {r.online && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" title="en ligne" />}
                  {r.id === profile.id && <span className="chip !text-[10px]">toi</span>}
                </span>
                <span className="hidden truncate text-xs text-ninja-muted sm:block">{gradeLabel(r.grade as never) || r.grade}</span>
                <span className="hidden text-right font-bold text-amber-300 sm:block">{formatRyos(r.ryos)}</span>
                <span className="hidden text-right text-xs sm:block">{r.elo}</span>
                <span className="hidden text-right text-xs text-orange-300 sm:block">🔥{r.streak || 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card text-xs text-ninja-muted">
        <SectionTitle icon="💡" title="Comment grimper au classement ?" />
        Enchaîne les quiz pour gagner des Ryos, gagne tes duels pour monter en ELO, et reviens chaque jour pour allonger ta série. Les
        joueurs de référence (Rayan, Lina, Adam…) te donnent un objectif à atteindre !
      </div>
    </div>
  );
};
