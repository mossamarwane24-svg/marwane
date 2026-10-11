import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useGame } from '../state/GameContext';
import { rankFromRyos } from '../data/ranks';
import { cx, formatRyos } from '../lib/format';
import { SoundToggle, Toaster } from './ui';
import { sfx } from '../lib/sound';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  group: 'jouer' | 'progresser' | 'social';
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Accueil', icon: '🏠', group: 'jouer' },
  { to: '/quiz', label: 'Entraînement', icon: '📝', group: 'jouer' },
  { to: '/examen', label: 'Examen Hokage', icon: '📜', group: 'jouer' },
  { to: '/party', label: 'Jeux à 4', icon: '🎲', group: 'jouer' },
  { to: '/duel', label: 'Duels', icon: '⚔️', group: 'social' },
  { to: '/kahoot', label: 'Kahoot', icon: '📺', group: 'social' },
  { to: '/arcade', label: 'Arcade', icon: '🎰', group: 'jouer' },
  { to: '/defis', label: 'Défis', icon: '🎯', group: 'progresser' },
  { to: '/badges', label: 'Badges', icon: '🏅', group: 'progresser' },
  { to: '/grades', label: 'Grades', icon: '🍥', group: 'progresser' },
  { to: '/classement', label: 'Classement', icon: '🏆', group: 'social' },
  { to: '/amis', label: 'Amis & joueurs', icon: '🫂', group: 'social' },
  { to: '/erreurs', label: 'Cahier d’erreurs', icon: '📕', group: 'progresser' },
  { to: '/revision', label: 'À imprimer', icon: '🖨️', group: 'progresser' },
  { to: '/creer', label: 'Mode créateur', icon: '🛠️', group: 'progresser' },
  { to: '/profil', label: 'Profil', icon: '⚙️', group: 'progresser' }
];

const GROUP_LABEL: Record<NavItem['group'], string> = {
  jouer: 'Jouer',
  progresser: 'Progresser',
  social: 'En ligne & social'
};

export const Layout: React.FC = () => {
  const { profile, save, netStatus, onlineCount, toast } = useGame();
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const rank = rankFromRyos(profile.ryos);
  const pendingFriends = save.friends.incoming.length;

  const bottomItems = [NAV[0], NAV[1], NAV[3], NAV[4]];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx(
      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
      isActive ? 'bg-amber-500/20 text-amber-200' : 'text-ninja-muted hover:bg-ninja-panel2/70 hover:text-ninja-text'
    );

  return (
    <div className="min-h-full pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 border-b border-ninja-line bg-ninja-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => sfx.click()}>
            <span className="text-2xl floaty">🍥</span>
            <div className="leading-tight">
              <div className="gradient-text text-lg font-black tracking-tight">Académie Ninja</div>
              <div className="hidden text-[10px] uppercase tracking-widest text-ninja-muted sm:block">
                Apprends en jouant · Maths & Français
              </div>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="chip"
              title={netStatus === 'online' ? 'Serveur en ligne connecté' : 'Mode hors ligne'}
              onClick={() =>
                toast(
                  netStatus === 'online'
                    ? `Serveur en ligne : ${onlineCount} ninja(s) connecté(s) !`
                    : 'Hors ligne : les jeux à 4 fonctionnent avec des bots. Lance « npm run dev » + « npm run server » pour le mode en ligne.',
                  netStatus === 'online' ? 'success' : 'info',
                  netStatus === 'online' ? '📡' : '🔌'
                )
              }
            >
              <span className={cx('h-2 w-2 rounded-full', netStatus === 'online' ? 'bg-emerald-400' : 'bg-ninja-muted')} />
              {netStatus === 'online' ? `${onlineCount} en ligne` : 'hors ligne'}
            </button>
            <div className="chip !border-amber-400/40 !text-amber-200" title="Ta monnaie ninja">
              🪙 {formatRyos(profile.ryos)}
            </div>
            <div className="chip hidden !border-white/10 sm:inline-flex" title={rank.name}>
              {rank.emoji} {rank.name}
            </div>
            <SoundToggle />
            <Link to="/profil" className="btn-ghost !px-3 !py-2 text-lg" title="Profil">
              {profile.avatar}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-3 pt-5 sm:px-4">
        <aside className="sticky top-24 hidden h-fit w-60 shrink-0 lg:block">
          <nav className="card !p-3">
            {(['jouer', 'progresser', 'social'] as NavItem['group'][]).map((group) => (
              <div key={group} className="mb-3 last:mb-0">
                <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-widest text-ninja-muted/70">
                  {GROUP_LABEL[group]}
                </div>
                <div className="flex flex-col gap-0.5">
                  {NAV.filter((n) => n.group === group).map((item) => (
                    <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {item.to === '/amis' && pendingFriends > 0 && (
                        <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                          {pendingFriends}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      {/* Barre de navigation mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ninja-line bg-ninja-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="flex items-stretch justify-around">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => sfx.click()}
              className={({ isActive }) =>
                cx('flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold', isActive ? 'text-amber-300' : 'text-ninja-muted')
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setMoreOpen((v) => !v);
              sfx.click();
            }}
            className={cx('flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold', moreOpen ? 'text-amber-300' : 'text-ninja-muted')}
          >
            <span className="text-xl">☰</span>
            Plus
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[75vh] animate-slideUp overflow-y-auto rounded-t-3xl border-t border-ninja-line bg-ninja-panel p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h2">Menu ninja</div>
              <button className="btn-ghost !px-3 !py-1" onClick={() => setMoreOpen(false)}>
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMoreOpen(false)}
                  className={cx(
                    'flex items-center gap-2 rounded-xl border border-ninja-line p-3 text-sm font-bold',
                    location.pathname === item.to ? 'bg-amber-500/20 text-amber-200' : 'bg-ninja-panel2/60'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                  {item.to === '/amis' && pendingFriends > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">{pendingFriends}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};
