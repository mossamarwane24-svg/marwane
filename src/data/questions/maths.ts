import type { GradeId, Question } from '../../types';

export type RawQ = Omit<Question, 'id' | 'subject' | 'band'>;

const rint = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickOne = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const shuffle = <T,>(a: T[]): T[] => {
  const c = [...a];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
};

/** Construit une question a choix multiples avec les propositions melangees. */
export function mk(
  prompt: string,
  correct: string,
  wrongs: string[],
  explanation: string,
  level: 1 | 2 | 3,
  grades?: GradeId[]
): RawQ {
  const unique: string[] = [];
  for (const w of wrongs) {
    const str = String(w);
    if (!str || str === correct || unique.includes(str)) continue;
    unique.push(str);
    if (unique.length === 3) break;
  }
  const numeric = Number(correct);
  let step = 1;
  while (unique.length < 3 && step < 40) {
    const candidate = correct.trim() !== '' && Number.isFinite(numeric) ? String(numeric + step) : `${correct} (variante ${step})`;
    if (candidate !== correct && !unique.includes(candidate)) unique.push(candidate);
    step += 1;
  }
  const choices = shuffle([correct, ...unique]);
  return { prompt, choices, answer: choices.indexOf(correct), explanation, level, grades };
}

/** Genere des mauvaises reponses numeriques proches et plausibles. */
const near = (n: number, spread = 4): string[] => {
  const out = new Set<number>();
  let guard = 0;
  while (out.size < 3 && guard++ < 40) {
    const d = rint(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    if (n + d !== n) out.add(n + d);
  }
  return [...out].map(String);
};

const num = (n: number) => String(n).replace('.', ',');
const money = (n: number) => `${num(n)} €`;
const rep = (s: string, n: number) => Array.from({ length: n }, () => s).join(' ');

type Gen = (level: 1 | 2 | 3) => RawQ;

// ============================ MATERNELLE ===================================

const MS: Gen[] = [
  // Compter des objets
  (lv) => {
    const max = lv === 1 ? 5 : lv === 2 ? 7 : 9;
    const n = rint(2, max);
    const e = pickOne(['🍎', '🐟', '⭐', '🐸', '🎈', '🍓']);
    return mk(`Combien y a-t-il de ${e} ?\n${rep(e, n)}`, String(n), near(n, 3), `On compte : il y a ${n} ${e}.`, lv);
  },
  // Reconnaitre un chiffre ecrit
  (lv) => {
    const max = lv === 1 ? 5 : lv === 2 ? 9 : 10;
    const n = rint(1, max);
    const words = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
    return mk(`Quel nombre s’écrit « ${words[n]} » ?`, String(n), near(n, 4), `« ${words[n]} » s’écrit ${n}.`, lv);
  },
  // Suite numerique
  (lv) => {
    const max = lv === 1 ? 5 : lv === 2 ? 8 : 10;
    const a = rint(1, max - 2);
    return mk(`Que vient juste après ?  ${a} , ${a + 1} , ...`, String(a + 2), near(a + 2, 3), `Après ${a + 1} vient ${a + 2}.`, lv);
  },
  // Formes geometriques
  (lv) => {
    const formes: [string, string, string[]][] = [
      ['le cercle 🔵', '🔵', ['⬛', '🔺', '⭐']],
      ['le carré 🟧', '🟧', ['🔵', '🔺', '💚']],
      ['le triangle 🔺', '🔺', ['🔵', '⬛', '⭐']],
      ['l’étoile ⭐', '⭐', ['🔵', '🔺', '⬛']]
    ];
    const [nom, bon, autres] = pickOne(formes);
    return mk(`Trouve ${nom}`, bon, autres, `La forme demandée est ${nom}.`, lv);
  },
  // Plus grand / plus petit
  (lv) => {
    const max = lv === 1 ? 5 : lv === 2 ? 8 : 10;
    const a = rint(1, max);
    let b = rint(1, max);
    while (b === a) b = rint(1, max);
    const grand = Math.max(a, b);
    const petit = Math.min(a, b);
    const wrongs = [String(petit), ...near(grand, 3)].filter((w) => w !== String(grand));
    return mk(`Quel nombre est le plus grand ?`, String(grand), wrongs, `Entre ${a} et ${b}, le plus grand est ${grand}.`, lv);
  },
  // Ajouter 1
  (lv) => {
    const n = rint(1, lv === 1 ? 5 : 9);
    return mk(`Combien font ${n} et encore 1 ?`, String(n + 1), near(n + 1, 3), `${n} + 1 = ${n + 1}.`, lv);
  },
  // Comparer deux collections
  (lv) => {
    const e = pickOne(['🐝', '🍒', '🚗']);
    const a = rint(2, lv === 1 ? 5 : 8);
    let b = rint(2, lv === 1 ? 5 : 8);
    while (b === a) b = rint(2, lv === 1 ? 5 : 8);
    const big = Math.max(a, b);
    return mk(`Dans quel groupe y a-t-il le plus de ${e} ?\nGroupe A : ${rep(e, a)}\nGroupe B : ${rep(e, b)}`, `Groupe ${a > b ? 'A' : 'B'}`, ['Groupe A', 'Groupe B', 'Il y en a autant'].filter((c) => c !== `Groupe ${a > b ? 'A' : 'B'}`), `Le groupe ${a > b ? 'A' : 'B'} en a ${big}.`, lv);
  }
];

const GS: Gen[] = [
  (lv) => {
    const max = lv === 1 ? 10 : lv === 2 ? 15 : 20;
    const n = rint(4, max);
    const e = pickOne(['🍬', '🐞', '🌻', '🧩']);
    return mk(`Combien de ${e} ?\n${rep(e, n)}`, String(n), near(n, 4), `Il y a ${n} ${e}.`, lv);
  },
  (lv) => {
    const max = lv === 1 ? 5 : lv === 2 ? 8 : 10;
    const a = rint(1, max);
    const b = rint(1, max);
    return mk(`${a} + ${b} = ?`, String(a + b), near(a + b, 4), `${a} + ${b} = ${a + b}.`, lv);
  },
  (lv) => {
    const pas = lv === 1 ? 2 : lv === 2 ? 2 : 5;
    const start = rint(1, 3);
    const suite = [start, start + pas, start + 2 * pas, start + 3 * pas];
    return mk(`Continue la suite : ${suite.slice(0, 3).join(' , ')} , ...`, String(start + 3 * pas), near(start + 3 * pas, 3), `On avance de ${pas} à chaque fois : ${start + 3 * pas}.`, lv);
  },
  (lv) => {
    const n = rint(3, lv === 1 ? 10 : 19);
    return mk(`Quel nombre vient juste avant ${n} ?`, String(n - 1), near(n - 1, 3), `${n - 1} vient juste avant ${n}.`, lv);
  },
  (lv) => {
    const n = lv === 1 ? 3 : lv === 2 ? 5 : 7;
    const formes: Record<number, [string, string[]]> = {
      3: ['le triangle', ['le carré', 'le rond', 'l’étoile']],
      4: ['le carré', ['le triangle', 'le rond', 'l’étoile']],
      5: ['le pentagone', ['le carré', 'le triangle', 'le rond']],
      7: ['l’heptagone', ['le carré', 'le triangle', 'le pentagone']]
    };
    const [nom, autres] = formes[n];
    return mk(`Quelle forme a ${n} côtés ?`, nom, autres, `La forme à ${n} côtés, c’est ${nom}.`, lv);
  },
  (lv) => {
    const a = rint(1, lv === 1 ? 4 : 6);
    return mk(`Quel est le double de ${a} ?`, String(a * 2), near(a * 2, 3), `Le double de ${a}, c’est ${a} + ${a} = ${a * 2}.`, lv);
  },
  (lv) => {
    const max = lv === 1 ? 10 : 20;
    const a = rint(1, max);
    let b = rint(1, max);
    while (b === a) b = rint(1, max);
    const petit = Math.min(a, b);
    return mk(`Quel nombre est le plus petit ?`, String(petit), near(petit, 4), `Entre ${a} et ${b}, le plus petit est ${petit}.`, lv);
  },
  (lv) => {
    const a = rint(2, lv === 1 ? 5 : 9);
    const b = rint(1, a);
    return mk(`${a} - ${b} = ?`, String(a - b), near(a - b, 3), `${a} - ${b} = ${a - b}.`, lv);
  }
];

// ============================ ELEMENTAIRE ==================================

const CP: Gen[] = [
  (lv) => {
    const max = lv === 1 ? 9 : lv === 2 ? 14 : 19;
    const a = rint(1, max);
    const b = rint(1, max - a > 0 ? max - a : 1);
    return mk(`${a} + ${b} = ?`, String(a + b), near(a + b, 3), `${a} + ${b} = ${a + b}.`, lv);
  },
  (lv) => {
    const a = rint(lv === 1 ? 6 : 10, lv === 3 ? 20 : 15);
    const b = rint(1, a - 1);
    return mk(`${a} - ${b} = ?`, String(a - b), near(a - b, 3), `${a} - ${b} = ${a - b}.`, lv);
  },
  (lv) => {
    const a = rint(1, lv === 3 ? 15 : 10);
    return mk(`Quel est le double de ${a} ?`, String(a * 2), near(a * 2, 3), `${a} + ${a} = ${a * 2}.`, lv);
  },
  (lv) => {
    const d = rint(2, lv === 1 ? 5 : 9);
    const u = rint(0, 9);
    const n = d * 10 + u;
    return mk(`Dans le nombre ${n}, combien y a-t-il de dizaines ?`, String(d), near(d, 3), `${n} = ${d} dizaines et ${u} unités.`, lv);
  },
  (lv) => {
    const a = rint(10, 90);
    const b = rint(10, 99);
    if (a === b) return CP[3](lv);
    return mk(`Quel nombre est le plus grand : ${a} ou ${b} ?`, String(Math.max(a, b)), [String(Math.min(a, b)), String(Math.max(a, b) + 10)], `Le plus grand est ${Math.max(a, b)}.`, lv);
  },
  (lv) => {
    const a = rint(1, 9);
    return mk(`Combien faut-il ajouter à ${a} pour faire 10 ?`, String(10 - a), near(10 - a, 3), `10 - ${a} = ${10 - a}.`, lv);
  },
  (lv) => {
    const a = rint(2, lv === 1 ? 6 : 9);
    const b = rint(3, 7);
    return mk(`Léo a ${a} billes. Il en gagne ${b}. Combien en a-t-il maintenant ?`, String(a + b), near(a + b, 3), `${a} + ${b} = ${a + b} billes.`, lv);
  },
  (lv) => {
    const start = rint(1, 6);
    const pas = lv === 1 ? 2 : lv === 2 ? 5 : 10;
    return mk(`Compte de ${pas} en ${pas} : ${start} , ${start + pas} , ${start + 2 * pas} , ...`, String(start + 3 * pas), near(start + 3 * pas, 5), `On ajoute ${pas} : ${start + 3 * pas}.`, lv);
  }
];

const CE1: Gen[] = [
  (lv) => {
    const a = rint(10, lv === 1 ? 49 : lv === 2 ? 79 : 99);
    const b = rint(5, 99 - a > 5 ? 99 - a : 10);
    return mk(`${a} + ${b} = ?`, String(a + b), near(a + b, 10), `${a} + ${b} = ${a + b}.`, lv);
  },
  (lv) => {
    const a = rint(30, 99);
    const b = rint(5, a - 5);
    return mk(`${a} - ${b} = ?`, String(a - b), near(a - b, 8), `${a} - ${b} = ${a - b}.`, lv);
  },
  (lv) => {
    const a = rint(2, lv === 1 ? 5 : 9);
    const b = rint(2, lv === 1 ? 5 : 9);
    return mk(`${a} × ${b} = ?`, String(a * b), near(a * b, 6), `${a} × ${b} = ${a * b} (table de ${a}).`, lv);
  },
  (lv) => {
    const a = rint(5, 45);
    return mk(`Quelle est la moitié de ${a * 2} ?`, String(a), near(a, 5), `La moitié de ${a * 2}, c’est ${a * 2} ÷ 2 = ${a}.`, lv);
  },
  (lv) => {
    const a = rint(3, 60);
    return mk(`${a} est-il pair ou impair ?`, a % 2 === 0 ? 'Pair' : 'Impair', ['Pair', 'Impair', 'Les deux'].filter((x) => x !== (a % 2 === 0 ? 'Pair' : 'Impair')), `${a} est ${a % 2 === 0 ? 'pair' : 'impair'} car il ${a % 2 === 0 ? 'se termine par un chiffre pair' : 'se termine par un chiffre impair'}.`, lv);
  },
  (lv) => {
    const a = rint(10, 95);
    return mk(`Combien faut-il ajouter à ${a} pour faire 100 ?`, String(100 - a), near(100 - a, 10), `100 - ${a} = ${100 - a}.`, lv);
  },
  (lv) => {
    const prix = rint(2, 9);
    const n = rint(2, lv === 1 ? 3 : 6);
    return mk(`Un carnet coûte ${prix} €. Combien coûtent ${n} carnets ?`, money(prix * n), [money(prix * n + prix), money(prix * n - prix), money(n + prix)], `${prix} × ${n} = ${prix * n} €.`, lv);
  },
  (lv) => {
    const n = rint(3, 9);
    const a = rint(2, 5);
    return mk(`${rep(String(a), n).trim().split(' ').join(' + ')} = ?`, String(a * n), near(a * n, 5), `${a} répété ${n} fois, c’est ${a} × ${n} = ${a * n}.`, lv);
  }
];

const CE2: Gen[] = [
  (lv) => {
    const a = rint(3, lv === 1 ? 5 : 9);
    const b = rint(3, lv === 1 ? 5 : 9);
    return mk(`${a} × ${b} = ?`, String(a * b), near(a * b, 8), `${a} × ${b} = ${a * b}.`, lv);
  },
  (lv) => {
    const a = rint(12, 98);
    const mult = pickOne([10, 100]);
    return mk(`${a} × ${mult} = ?`, String(a * mult), [String(a * (mult / 10)), String(a + mult), String(a * mult * 10)], `Pour multiplier par ${mult}, on ajoute ${mult === 10 ? 'un zéro' : 'deux zéros'} : ${a * mult}.`, lv);
  },
  (lv) => {
    const a = rint(200, 899);
    const b = rint(100, 199);
    return mk(`${a} - ${b} = ?`, String(a - b), near(a - b, 20), `${a} - ${b} = ${a - b}.`, lv);
  },
  (lv) => {
    const num2 = pickOne([2, 4, 3]);
    return mk(`Une pizza est coupée en ${num2} parts égales. Tu manges 1 part. Quelle fraction as-tu mangée ?`, `1/${num2}`, [`${num2}/1`, `2/${num2}`, `1/${num2 + 1}`], `1 part sur ${num2} = 1/${num2}.`, lv);
  },
  (lv) => {
    const c = rint(2, 12);
    return mk(`Quel est le périmètre d’un carré de côté ${c} cm ?`, `${c * 4} cm`, [`${c * 2} cm`, `${c * c} cm`, `${c + 4} cm`], `Périmètre du carré = 4 × côté = 4 × ${c} = ${c * 4} cm.`, lv);
  },
  (lv) => {
    const paquets = rint(2, 9);
    const parPaquet = rint(2, 9);
    return mk(`${paquets * parPaquet} bonbons sont partagés en ${paquets} paquets égaux. Combien de bonbons par paquet ?`, String(parPaquet), near(parPaquet, 4), `${paquets * parPaquet} ÷ ${paquets} = ${parPaquet}.`, lv);
  },
  (lv) => {
    const a = rint(1000, 9999);
    const b = rint(1000, 9999);
    return mk(`Quel nombre est le plus grand : ${a} ou ${b} ?`, String(Math.max(a, b)), [String(Math.min(a, b)), String(Math.max(a, b) + 1000)], `On compare les chiffres de gauche à droite : ${Math.max(a, b)} est le plus grand.`, lv);
  },
  (lv) => {
    const m = rint(2, 9);
    return mk(`${m} m = ... cm ?`, String(m * 100), [`${m * 10}`, `${m * 1000}`, `${m + 100}`], `1 m = 100 cm donc ${m} m = ${m * 100} cm.`, lv);
  }
];

const CM1: Gen[] = [
  (lv) => {
    const a = rint(12, 49);
    const b = rint(12, lv === 1 ? 29 : 49);
    return mk(`${a} × ${b} = ?`, String(a * b), near(a * b, 40), `${a} × ${b} = ${a * b}.`, lv);
  },
  (lv) => {
    const b = rint(3, 9);
    const q = rint(4, 12);
    return mk(`${b * q} ÷ ${b} = ?`, String(q), near(q, 4), `${b} × ${q} = ${b * q}, donc ${b * q} ÷ ${b} = ${q}.`, lv);
  },
  (lv) => {
    const a = rint(10, 90) / 10;
    const b = rint(10, 90) / 10;
    const s = Math.round((a + b) * 10) / 10;
    return mk(`${num(a)} + ${num(b)} = ?`, num(s), [num(s + 0.1), num(s - 0.2), num(s + 1)].map((x) => x.replace('.', ',')), `${num(a)} + ${num(b)} = ${num(s)}.`, lv);
  },
  (lv) => {
    const p = pickOne([50, 25, 10]);
    const n = p === 50 ? rint(2, 12) * 10 : rint(2, 20) * 10;
    const res = (n * p) / 100;
    return mk(`Combien font ${p} % de ${n} ?`, String(res), near(res, 5), `${p} % de ${n} = ${n} × ${p} ÷ 100 = ${res}.`, lv);
  },
  (lv) => {
    const L = rint(3, 12);
    const l = rint(2, 9);
    return mk(`Quel est le périmètre d’un rectangle de longueur ${L} cm et de largeur ${l} cm ?`, `${2 * (L + l)} cm`, [`${L * l} cm`, `${L + l} cm`, `${2 * L + l} cm`], `P = 2 × (L + l) = 2 × (${L} + ${l}) = ${2 * (L + l)} cm.`, lv);
  },
  (lv) => {
    const n = rint(2, 5);
    const prix = rint(2, 6);
    const q = rint(3, 9);
    return mk(`${n} stylos coûtent ${n * prix} €. Combien coûtent ${n * q} stylos ?`, money(prix * n * q), [money(prix * n), money(prix * (n * q + 1)), money(prix * q)], `1 stylo = ${prix} €, donc ${n * q} stylos = ${prix * n * q} €.`, lv);
  },
  (lv) => {
    const d = pickOne([5, 7, 9, 11]);
    const a = rint(1, d - 2);
    const b = rint(a + 1, d - 1);
    return mk(`Quelle fraction est la plus grande : ${a}/${d} ou ${b}/${d} ?`, `${b}/${d}`, [`${a}/${d}`, 'Elles sont égales', 'On ne peut pas savoir'], `Même dénominateur : la plus grande est celle avec le plus grand numérateur, donc ${b}/${d}.`, lv);
  },
  (lv) => {
    const h = rint(1, 6);
    return mk(`${h} h = ... min ?`, String(h * 60), [String(h * 100), String(h * 30), String(h * 60 + 60)], `1 h = 60 min donc ${h} h = ${h * 60} min.`, lv);
  }
];

const CM2: Gen[] = [
  (lv) => {
    const d = rint(3, 9);
    const q = rint(6, 25);
    const r = rint(1, d - 1);
    const n = d * q + r;
    return mk(`Dans la division de ${n} par ${d} : quel est le reste ?`, String(r), near(r, 3), `${n} = ${d} × ${q} + ${r} donc quotient ${q} et reste ${r}.`, lv);
  },
  (lv) => {
    const d = pickOne([5, 7, 8, 9, 12]);
    const a = rint(1, d - 2);
    const b = rint(1, d - a);
    const s = a + b;
    return mk(`${a}/${d} + ${b}/${d} = ?`, `${s}/${d}`, [`${s}/${d * 2}`, `${a + b}/${d * 2}`, `${a * b}/${d}`], `On additionne les numérateurs : ${a} + ${b} = ${s}, donc ${s}/${d}.`, lv);
  },
  (lv) => {
    const base = rint(4, 16);
    const h = rint(2, 10);
    return mk(`Aire d’un triangle de base ${base} cm et de hauteur ${h} cm ?`, `${(base * h) / 2} cm²`, [`${base * h} cm²`, `${base + h} cm²`, `${(base * h) / 4} cm²`], `Aire = (base × hauteur) ÷ 2 = ${(base * h) / 2} cm².`, lv);
  },
  (lv) => {
    const n = rint(2, 6);
    const prix = rint(2, 7);
    const q = rint(3, 8);
    return mk(`${n} gâteaux coûtent ${n * prix} €. Combien coûtent ${q} gâteaux ?`, money(prix * q), [money(prix * q + prix), money(prix * n), money(q * n)], `Prix d’un gâteau : ${prix} €, donc ${q} gâteaux : ${prix * q} €.`, lv);
  },
  (lv) => {
    const p = pickOne([10, 20, 25, 50]);
    const n = rint(2, 16) * 20;
    return mk(`${p} % de ${n} = ?`, String((n * p) / 100), near((n * p) / 100, 8), `${p} % de ${n} = ${n} × ${p} ÷ 100 = ${(n * p) / 100}.`, lv);
  },
  (lv) => {
    const a = rint(10, 900) / 10;
    return mk(`${num(a)} × 10 = ?`, num(a * 10), [num(a * 100), num(a + 10), num(a / 10)], `Multiplier par 10 décale la virgule d’un rang : ${num(a * 10)}.`, lv);
  },
  (lv) => {
    const v = pickOne([60, 80, 90, 100]);
    const t = rint(2, 5);
    return mk(`Un train roule à ${v} km/h pendant ${t} h. Quelle distance parcourt-il ?`, `${v * t} km`, [`${v + t} km`, `${v * t * 2} km`, `${v / t} km`], `Distance = vitesse × temps = ${v} × ${t} = ${v * t} km.`, lv);
  },
  (lv) => {
    const c = rint(2, 9);
    return mk(`Volume d’un cube d’arête ${c} cm ?`, `${c ** 3} cm³`, [`${c * c} cm³`, `${c * 6} cm³`, `${c * 3} cm³`], `V = arête × arête × arête = ${c}³ = ${c ** 3} cm³.`, lv);
  }
];

// ============================== COLLEGE ====================================

const SIXIEME: Gen[] = [
  (lv) => {
    const a = rint(2, 9);
    const b = rint(2, 9);
    const c = rint(1, 9);
    return mk(`${a} + ${b} × ${c} = ?`, String(a + b * c), [String((a + b) * c), String(a * b + c), String(a + b + c)], `La multiplication est prioritaire : ${b} × ${c} = ${b * c}, puis ${a} + ${b * c} = ${a + b * c}.`, lv);
  },
  (lv) => {
    const a = rint(10, 90) / 10;
    const b = rint(10, 90) / 10;
    return mk(`Quel est le plus grand : ${num(a)} ou ${num(b)} ?`, num(Math.max(a, b)), [num(Math.min(a, b)), num(Math.max(a, b) + 0.5)], `On compare les dixièmes : ${num(Math.max(a, b))} est plus grand.`, lv);
  },
  (lv) => {
    const k = rint(2, 6);
    const a = rint(1, 6);
    return mk(`Simplifie la fraction ${a * k}/${6 * k}`, `${a}/6`, [`${a * k}/6`, `${a}/${6 * k}`, `${a * 2}/6`], `On divise numérateur et dénominateur par ${k} : ${a}/6.`, lv);
  },
  (lv) => {
    const r = rint(2, 10);
    return mk(`Périmètre d’un cercle de rayon ${r} cm (π ≈ 3,14) ?`, `${num(Math.round(2 * 3.14 * r * 100) / 100)} cm`, [`${num(Math.round(3.14 * r * r * 100) / 100)} cm`, `${num(Math.round(3.14 * r * 100) / 100)} cm`, `${num(Math.round(6 * r * 100) / 100)} cm`], `P = 2 × π × r = 2 × 3,14 × ${r} ≈ ${num(Math.round(2 * 3.14 * r * 100) / 100)} cm.`, lv);
  },
  (lv) => {
    const n = rint(10, 40) * 10;
    const p = pickOne([15, 20, 25, 30]);
    return mk(`${p} % de ${n} = ?`, String((n * p) / 100), near((n * p) / 100, 10), `${n} × ${p} ÷ 100 = ${(n * p) / 100}.`, lv);
  },
  (lv) => {
    return mk(`Le nombre 237 est-il divisible par 3 ?`, 'Oui', ['Non', 'Seulement par 9', 'On ne peut pas savoir'], `2 + 3 + 7 = 12, et 12 est divisible par 3 : donc oui.`, lv);
  },
  (lv) => {
    const kg = rint(2, 9);
    return mk(`${kg} kg = ... g ?`, String(kg * 1000), [`${kg * 100}`, `${kg * 10}`, `${kg * 10000}`], `1 kg = 1 000 g donc ${kg} kg = ${kg * 1000} g.`, lv);
  },
  (lv) => {
    const n = rint(2, 9);
    const x = rint(2, 9);
    return mk(`Si ${n} cahiers coûtent ${n * x} €, combien coûtent 5 cahiers ?`, money(x * 5), [money(x * 3), money(x * 5 + x), money(n * x)], `1 cahier = ${x} €, donc 5 cahiers = ${x * 5} €.`, lv);
  }
];

const CINQUIEME: Gen[] = [
  (lv) => {
    const a = rint(-9, -1);
    const b = rint(1, 9);
    return mk(`(${a}) + (${b}) = ?`, String(a + b), near(a + b, 4), `${a} + ${b} = ${a + b}.`, lv);
  },
  (lv) => {
    const a = rint(-9, -1);
    const b = rint(a + 1, 9);
    return mk(`Quel est le plus grand : ${a} ou ${b} ?`, String(b), [String(a), 'Ils sont égaux', 'Cela dépend'], `Sur la droite graduée, ${b} est à droite de ${a}.`, lv);
  },
  (lv) => {
    const a = rint(2, 9);
    return mk(`Réduis : ${a}x + ${a + rint(1, 5)}x`, `${a + (a + 3)}x`, [`${a * (a + 3)}x`, `${a}x`, `${a + 3}x`], `On additionne les coefficients : ${a} + ${a + 3} = ${2 * a + 3}, donc ${2 * a + 3}x.`, lv);
  },
  (lv) => {
    const a = rint(2, 9);
    const b = rint(2, 9);
    return mk(`Développe : ${a}(x + ${b})`, `${a}x + ${a * b}`, [`${a}x + ${b}`, `${a}x + ${a + b}`, `${a + b}x`], `${a} × x + ${a} × ${b} = ${a}x + ${a * b}.`, lv);
  },
  (lv) => {
    const n = rint(2, 12) * 10;
    return mk(`Augmenter ${n} de 10 %, cela donne :`, String(Math.round(n * 1.1)), [`${n + 10}`, `${Math.round(n * 0.9)}`, `${Math.round(n * 1.01)}`], `${n} × 1,1 = ${Math.round(n * 1.1)}.`, lv);
  },
  (lv) => {
    const b = rint(4, 16);
    const h = rint(3, 10);
    return mk(`Aire d’un triangle de base ${b} cm et hauteur ${h} cm ?`, `${(b * h) / 2} cm²`, [`${b * h} cm²`, `${(b * h) / 3} cm²`, `${b + h} cm²`], `A = (b × h) ÷ 2 = ${(b * h) / 2} cm².`, lv);
  },
  (lv) => {
    const d = rint(2, 6);
    const n1 = rint(1, d - 1);
    return mk(`${n1}/${d} + ${d - n1}/${d} = ?`, '1', ['2', `${d}/${d + 1}`, `${n1 * 2}/${d}`], `La somme des numérateurs vaut ${d}, donc ${d}/${d} = 1.`, lv);
  },
  (lv) => {
    const d = rint(60, 300);
    const t = rint(2, 5);
    return mk(`Tu parcours ${d} km en ${t} h. Quelle est ta vitesse moyenne ?`, `${d / t} km/h`, [`${d * t} km/h`, `${d - t} km/h`, `${d / (t + 1)} km/h`], `v = d ÷ t = ${d} ÷ ${t} = ${d / t} km/h.`, lv);
  }
];

const QUATRIEME: Gen[] = [
  (lv) => {
    const a = rint(2, 6);
    const n = rint(2, 4);
    return mk(`${a}^${n} = ?`, String(a ** n), [String(a * n), String(a ** (n + 1)), String(a + n)], `${a}^${n} = ${Array.from({ length: n }, () => a).join(' × ')} = ${a ** n}.`, lv);
  },
  (lv) => {
    return mk(`Un triangle rectangle a des côtés de 3 cm et 4 cm. Quelle est l’hypoténuse ?`, '5 cm', ['7 cm', '6 cm', '12 cm'], `Pythagore : 3² + 4² = 9 + 16 = 25, √25 = 5 cm.`, lv);
  },
  (lv) => {
    const a = rint(2, 7);
    const b = rint(2, 9);
    return mk(`Développe : ${a}(2x + ${b})`, `${2 * a}x + ${a * b}`, [`${a}x + ${a * b}`, `${2 * a}x + ${b}`, `${a * b}x + 2`], `${a} × 2x = ${2 * a}x et ${a} × ${b} = ${a * b}.`, lv);
  },
  (lv) => {
    const a = rint(2, 6);
    const s = rint(6, 20);
    const x = 3;
    return mk(`Résous : ${a}x + ${s - a * x} = ${s}`, String(x), near(x, 4), `${a}x = ${s} - ${s - a * x} = ${a * x}, donc x = ${x}.`, lv);
  },
  (lv) => {
    const a = rint(-9, -2);
    const b = rint(2, 9);
    return mk(`(${a}) × (${b}) = ?`, String(a * b), [String(-a * b), String(a + b), String(a * b * -1)], `Le produit de deux nombres de signes contraires est négatif : ${a * b}.`, lv);
  },
  (lv) => {
    const m = rint(2, 9);
    const p = rint(2, 6);
    return mk(`Écris ${m} × 10^${p} en écriture décimale`, String(m * 10 ** p), [String(m * 10 ** (p + 1)), String(m * 10 ** (p - 1)), String(m + p)], `${m} × 10^${p} = ${m} suivi de ${p} zéros = ${m * 10 ** p}.`, lv);
  },
  (lv) => {
    const r = rint(4, 15);
    const carre = r * r;
    return mk(`√${carre} = ?`, String(r), near(r, 4), `${r} × ${r} = ${carre} donc √${carre} = ${r}.`, lv);
  },
  (lv) => {
    const c = rint(2, 8);
    return mk(`Aire d’un disque de rayon ${c} cm (π ≈ 3,14) ?`, `${num(Math.round(3.14 * c * c * 100) / 100)} cm²`, [`${num(Math.round(6.28 * c * 100) / 100)} cm²`, `${num(Math.round(3.14 * c * 2 * 100) / 100)} cm²`, `${c * c} cm²`], `A = π × r² = 3,14 × ${c}² = ${num(Math.round(3.14 * c * c * 100) / 100)} cm².`, lv);
  }
];

const TROISIEME: Gen[] = [
  (lv) => {
    const a = rint(2, 7);
    const x = rint(2, 9);
    const b = rint(1, 9);
    return mk(`Résous : ${a}x + ${b} = ${a * x + b}`, String(x), near(x, 4), `${a}x = ${a * x + b} - ${b} = ${a * x} donc x = ${x}.`, lv);
  },
  (lv) => {
    const a = rint(2, 8);
    return mk(`Factorise : ${a}x + ${a * 3}`, `${a}(x + 3)`, [`${a}(x + ${a * 3})`, `${a}x(x + 3)`, `${a * 3}(x + 1)`], `Le facteur commun est ${a} : ${a}x + ${a * 3} = ${a}(x + 3).`, lv);
  },
  (lv) => {
    const a = rint(2, 9);
    return mk(`Développe : (x + ${a})²`, `x² + ${2 * a}x + ${a * a}`, [`x² + ${a * a}`, `x² + ${a}x + ${a * a}`, `x² + ${2 * a}x + ${a * 2}`], `(a + b)² = a² + 2ab + b² : x² + ${2 * a}x + ${a * a}.`, lv);
  },
  (lv) => {
    const r = rint(4, 15);
    return mk(`√${r * r} = ?`, String(r), near(r, 5), `${r}² = ${r * r} donc √${r * r} = ${r}.`, lv);
  },
  (lv) => {
    const a = rint(2, 9);
    return mk(`Soit f(x) = ${a}x. Combien vaut f(4) ?`, String(a * 4), [String(a + 4), String(a * 5), String(4)], `f(4) = ${a} × 4 = ${a * 4}.`, lv);
  },
  (lv) => {
    return mk(`Dans un triangle, cos(60°) = ?`, '0,5', ['0,866', '1', '0,707'], `cos(60°) = 0,5 : c’est une valeur remarquable à connaître.`, lv);
  },
  (lv) => {
    const n = rint(20, 90) * 10;
    const p = rint(10, 40);
    return mk(`Un article de ${n} € augmente de ${p} %. Nouveau prix ?`, money(Math.round(n * (1 + p / 100))), [money(n + p), money(Math.round(n * (1 - p / 100))), money(Math.round(n * (1 + p / 1000)))], `${n} × (1 + ${p}/100) = ${Math.round(n * (1 + p / 100))} €.`, lv);
  },
  (lv) => {
    return mk(`Théorème de Thalès : à quelle condition peut-on l’utiliser ?`, 'Deux droites parallèles coupées par deux sécantes', ['Un triangle isocèle', 'Un triangle équilatéral', 'Un cercle et une tangente'], `Thalès nécessite deux droites parallèles coupées par deux droites sécantes (configuration triangulaire).`, lv);
  }
];

export const MATHS_GENERATORS: Record<GradeId, Gen[]> = {
  MS, GS, CP, CE1, CE2, CM1, CM2, '6E': SIXIEME, '5E': CINQUIEME, '4E': QUATRIEME, '3E': TROISIEME
};

/** Genere une question de maths pour une classe et un niveau donnes. */
export const genMaths = (grade: GradeId, levels: (1 | 2 | 3)[]): RawQ => {
  const gens = MATHS_GENERATORS[grade] || CP;
  const lv = pickOne(levels);
  const compatible = gens; // chaque generateur s'adapte au niveau
  return pickOne(compatible)(lv);
};

/** Genere un lot de questions de maths en evitant les doublons de consigne. */
export const genMathsBatch = (grade: GradeId, levels: (1 | 2 | 3)[], count: number): RawQ[] => {
  const out: RawQ[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard++ < count * 30) {
    const q = genMaths(grade, levels);
    const key = q.prompt.slice(0, 40).replace(/\d+/g, '#');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  // Filet de securite : si la banque manque de variete, on complete quand meme
  // pour toujours avoir le nombre de questions demande.
  guard = 0;
  while (out.length < count && guard++ < count * 10) {
    out.push(genMaths(grade, levels));
  }
  return out;
};
