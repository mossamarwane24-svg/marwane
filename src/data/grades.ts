import type { Band, GradeId, GradeInfo, SubjectId } from '../types';

export const GRADES: GradeInfo[] = [
  { id: 'MS', label: 'Maternelle — Moyenne Section', band: 'maternelle', order: 0, age: '4 ans', emoji: '🧸' },
  { id: 'GS', label: 'Maternelle — Grande Section', band: 'maternelle', order: 1, age: '5 ans', emoji: '🎨' },
  { id: 'CP', label: 'CP', band: 'elementaire', order: 2, age: '6-7 ans', emoji: '✏️' },
  { id: 'CE1', label: 'CE1', band: 'elementaire', order: 3, age: '7-8 ans', emoji: '📗' },
  { id: 'CE2', label: 'CE2', band: 'elementaire', order: 4, age: '8-9 ans', emoji: '📘' },
  { id: 'CM1', label: 'CM1', band: 'elementaire', order: 5, age: '9-10 ans', emoji: '📙' },
  { id: 'CM2', label: 'CM2', band: 'elementaire', order: 6, age: '10-11 ans', emoji: '📕' },
  { id: '6E', label: '6ème', band: 'college', order: 7, age: '11-12 ans', emoji: '🎒' },
  { id: '5E', label: '5ème', band: 'college', order: 8, age: '12-13 ans', emoji: '📐' },
  { id: '4E', label: '4ème', band: 'college', order: 9, age: '13-14 ans', emoji: '🧪' },
  { id: '3E', label: '3ème', band: 'college', order: 10, age: '14-15 ans', emoji: '🎓' }
];

export const gradeById = (id: GradeId): GradeInfo =>
  GRADES.find((g) => g.id === id) || GRADES[4];

export const gradeLabel = (id: GradeId): string => gradeById(id).label;

export const bandOf = (id: GradeId): Band => gradeById(id).band;

export const BANDS: { id: Band; label: string; emoji: string }[] = [
  { id: 'maternelle', label: 'Maternelle', emoji: '🧸' },
  { id: 'elementaire', label: 'Élémentaire', emoji: '✏️' },
  { id: 'college', label: 'Collège', emoji: '🎓' }
];

export const SUBJECTS: { id: SubjectId; name: string; emoji: string; color: string; desc: string }[] = [
  { id: 'maths', name: 'Mathématiques', emoji: '➕', color: 'from-orange-500 to-amber-400', desc: 'Calcul, géométrie, fractions, problèmes' },
  { id: 'francais', name: 'Français', emoji: '📚', color: 'from-blue-500 to-cyan-400', desc: 'Orthographe, conjugaison, vocabulaire' },
  { id: 'histoire', name: 'Histoire-Géo', emoji: '🗺️', color: 'from-amber-600 to-yellow-500', desc: 'Dates, lieux, personnages, géographie' },
  { id: 'sciences', name: 'Sciences', emoji: '🔬', color: 'from-emerald-500 to-lime-400', desc: 'Corps humain, animaux, planète, énergie' },
  { id: 'anglais', name: 'Anglais', emoji: '🇬🇧', color: 'from-purple-500 to-fuchsia-400', desc: 'Vocabulaire et phrases simples' }
];

export const subjectById = (id: SubjectId) =>
  SUBJECTS.find((s) => s.id === id) || SUBJECTS[0];

export const DIFFICULTIES: { id: 'facile' | 'moyen' | 'difficile'; name: string; emoji: string; desc: string }[] = [
  { id: 'facile', name: 'Facile', emoji: '🌱', desc: 'Questions simples, 4 choix, 40 s par question' },
  { id: 'moyen', name: 'Moyen', emoji: '🔥', desc: 'Le niveau de ta classe, 30 s par question' },
  { id: 'difficile', name: 'Difficile', emoji: '⚡', desc: 'Questions pièges, 20 s par question, plus de Ryos' }
];

export const DIFFICULTY_INFO = {
  facile: { label: 'Facile', emoji: '🌱', seconds: 40, ryosMultiplier: 1 },
  moyen: { label: 'Moyen', emoji: '🔥', seconds: 30, ryosMultiplier: 1.5 },
  difficile: { label: 'Difficile', emoji: '⚡', seconds: 20, ryosMultiplier: 2 }
} as const;

export const AVATARS: string[] = [
  '🦊', '🐸', '🐯', '🐼', '🦁', '🐨', '🐧', '🐢', '🦉', '🐺',
  '🐉', '🦅', '🐙', '🦄', '🐝', '🦈', '🐰', '🐻', '🐳', '🦋'
];

export const THEMES: { id: string; name: string; ring: string; glow: string }[] = [
  { id: 'konoha', name: 'Konoha', ring: 'ring-amber-400/60', glow: 'from-amber-500/20 to-orange-500/10' },
  { id: 'sable', name: 'Sable', ring: 'ring-yellow-300/60', glow: 'from-yellow-400/20 to-amber-500/10' },
  { id: 'brume', name: 'Brume', ring: 'ring-slate-300/50', glow: 'from-slate-400/20 to-slate-600/10' },
  { id: 'orage', name: 'Orage', ring: 'ring-purple-400/60', glow: 'from-purple-500/25 to-indigo-500/10' },
  { id: 'feu', name: 'Feu', ring: 'ring-red-400/60', glow: 'from-red-500/25 to-orange-500/10' }
];
