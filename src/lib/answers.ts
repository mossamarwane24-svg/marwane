// ---------------------------------------------------------------------------
// Comparaison tolerante des reponses tapees au clavier
// (accents, majuscules, espaces, virgule/point, articles...)
// ---------------------------------------------------------------------------

export const normalizeAnswer = (raw: string): string =>
  String(raw ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // enleve les accents
    .replace(/[’`´]/g, "'")
    .replace(/œ/g, 'oe')
    .replace(/\s+/g, ' ')
    .replace(/\s*([,.;:!?])\s*/g, '$1')
    .replace(/[.]$/, '')
    .trim();

const stripArticles = (s: string) => s.replace(/^(des|les|un|une|le|la|l'|du|de la)\s+/, '').trim();

const asNumber = (s: string): number | null => {
  const cleaned = s.replace(/\s/g, '').replace(',', '.').replace(/(cm|mm|km|m|kg|g|cl|l|min|h|°|an|ans|jours?|s)$/i, '');
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : null;
};

/** Vrai si la reponse tapee correspond a la bonne reponse. */
export const answersMatch = (typed: string, expected: string): boolean => {
  const a = normalizeAnswer(typed);
  const b = normalizeAnswer(expected);
  if (!a) return false;
  if (a === b) return true;
  if (stripArticles(a) === stripArticles(b)) return true;

  const na = asNumber(a);
  const nb = asNumber(b);
  if (na !== null && nb !== null && Math.abs(na - nb) < 1e-9) return true;

  // Reponses multiples : "3, 5 et 7" contient la bonne reponse.
  if (b.length >= 3 && (a.includes(b) || b.includes(a))) return true;

  // Ponctuation et espaces ignores ("12cm" == "12 cm", "a b c" == "abc").
  const compact = (s: string) => s.replace(/[^a-z0-9]/g, '');
  if (compact(a) && compact(a) === compact(b)) return true;

  return false;
};

/** Une reponse courte (<= 14 caracteres) peut etre tapee au clavier facilement. */
export const isTypeableAnswer = (answer: string): boolean => {
  const n = normalizeAnswer(answer);
  return n.length > 0 && n.length <= 14 && !n.includes('\n');
};

/** Indice affiche quand l'eleve saisit sa reponse. */
export const answerHint = (answer: string): string => {
  const trimmed = String(answer ?? '').trim();
  if (asNumber(normalizeAnswer(trimmed)) !== null) return '🔢 Écris un nombre';
  if (/^(vrai|faux|oui|non)$/i.test(trimmed)) return '💡 Écris « vrai » ou « faux »';
  return `✍️ ${trimmed.length} caractères environ`;
};
