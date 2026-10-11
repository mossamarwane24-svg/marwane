import type { RankInfo } from '../types';

// 15 grades ninja : on progresse grace aux Ryos gagnes dans les quiz,
// les duels, les defis et les jeux a 4 joueurs.
export const RANKS: RankInfo[] = [
  { id: 'aspirant', name: 'Aspirant', min: 0, emoji: '🌱', colors: ['#64748b', '#94a3b8'], perk: 'Bienvenue à l’Académie' },
  { id: 'eleve', name: 'Élève Ninja', min: 150, emoji: '🎒', colors: ['#0ea5e9', '#38bdf8'], perk: '+2 % de Ryos' },
  { id: 'genin', name: 'Genin', min: 400, emoji: '🍥', colors: ['#22c55e', '#86efac'], perk: 'Machine à sous débloquée' },
  { id: 'genin2', name: 'Genin Confirmé', min: 800, emoji: '⭐', colors: ['#10b981', '#6ee7b7'], perk: '+2 % de Ryos' },
  { id: 'chunin', name: 'Chunin', min: 1400, emoji: '🏅', colors: ['#f59e0b', '#fcd34d'], perk: 'Défis hebdo ×2' },
  { id: 'chunin2', name: 'Chunin d’Élite', min: 2200, emoji: '🎖️', colors: ['#f97316', '#fdba74'], perk: '+2 % de Ryos' },
  { id: 'jonin', name: 'Jonin', min: 3200, emoji: '⚔️', colors: ['#ef4444', '#fca5a5'], perk: 'Salle des duels privée' },
  { id: 'joninS', name: 'Jonin de Classe S', min: 4500, emoji: '💠', colors: ['#8b5cf6', '#c4b5fd'], perk: '+2 % de Ryos' },
  { id: 'anbu', name: 'ANBU', min: 6000, emoji: '🎭', colors: ['#334155', '#94a3b8'], perk: 'Statut masqué dans le classement' },
  { id: 'sannin', name: 'Sannin Légendaire', min: 8000, emoji: '🐍', colors: ['#a855f7', '#e9d5ff'], perk: '+5 % de Ryos' },
  { id: 'kage', name: 'Kage', min: 10500, emoji: '🗻', colors: ['#0369a1', '#7dd3fc'], perk: 'Couronne dorée sur ton avatar' },
  { id: 'kage2', name: 'Kage Suprême', min: 13500, emoji: '👑', colors: ['#eab308', '#fef08a'], perk: '+5 % de Ryos' },
  { id: 'sage', name: 'Sage des Six Chemins', min: 17000, emoji: '🌀', colors: ['#6366f1', '#a5b4fc'], perk: 'Aura légendaire' },
  { id: 'hokage', name: 'Hokage', min: 21000, emoji: '🔥', colors: ['#f97316', '#fde047'], perk: 'Le visage sur la montagne' },
  { id: 'hokage2', name: 'Hokage Éternel', min: 26000, emoji: '☀️', colors: ['#facc15', '#fff7ae'], perk: 'Légende de Konoha' }
];

export const rankFromRyos = (ryos: number): RankInfo =>
  [...RANKS].reverse().find((r) => ryos >= r.min) || RANKS[0];

export const nextRank = (ryos: number): RankInfo | null =>
  RANKS.find((r) => r.min > ryos) || null;

export const rankProgress = (ryos: number): { current: RankInfo; next: RankInfo | null; pct: number; missing: number } => {
  const current = rankFromRyos(ryos);
  const next = nextRank(ryos);
  if (!next) return { current, next: null, pct: 100, missing: 0 };
  const span = next.min - current.min;
  const done = ryos - current.min;
  const pct = span <= 0 ? 100 : Math.max(0, Math.min(100, Math.round((done / span) * 100)));
  return { current, next, pct, missing: next.min - ryos };
};

export const rankIndex = (ryos: number): number => RANKS.indexOf(rankFromRyos(ryos));

/** Petit bonus de Ryos en fonction du grade ninja (2 % par palier). */
export const rankBonus = (ryos: number): number => 1 + rankIndex(ryos) * 0.02;

// Ligues de duel (ELO)
export const ELO_TIERS: { name: string; min: number; emoji: string }[] = [
  { name: 'Genin de Bronze', min: 0, emoji: '🥉' },
  { name: 'Chunin d’Argent', min: 1000, emoji: '🥈' },
  { name: 'Jonin d’Or', min: 1200, emoji: '🥇' },
  { name: 'ANBU de Platine', min: 1350, emoji: '💎' },
  { name: 'Kage Légendaire', min: 1500, emoji: '👑' }
];

export const eloTier = (elo: number) =>
  [...ELO_TIERS].reverse().find((t) => elo >= t.min) || ELO_TIERS[0];
