/** Utilitaires d'affichage. */

export const formatRyos = (n: number): string => {
  const v = Math.round(n);
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} M`;
  if (Math.abs(v) >= 10_000) return `${(v / 1000).toFixed(1).replace('.', ',')} k`;
  return v.toLocaleString('fr-FR');
};

export const ryosLabel = (n: number): string => `${formatRyos(n)} Ryos`;

export const formatDate = (ts: number): string =>
  new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatDay = (d: string): string => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, (m || 1) - 1, day || 1).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
};

export const pct = (a: number, b: number): number => (b <= 0 ? 0 : Math.round((a / b) * 100));

export const todayKey = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const daysBetween = (a: string, b: string): number => {
  const da = new Date(`${a}T00:00:00`).getTime();
  const db = new Date(`${b}T00:00:00`).getTime();
  return Math.round((db - da) / 86400000);
};

/** Petite fonction utilitaire "classnames". */
export const cx = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(' ');

export const randCode = (len = 6): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
