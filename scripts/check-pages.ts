/**
 * Rend TOUTES les pages de l'application dans un DOM virtuel (jsdom) pour
 * verifier qu'elles s'affichent sans erreur et avec le bon contenu.
 * Lance avec `npm run check:pages`.
 */
import './dom-setup';

import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import App from '../src/App';
import { defaultSave, writeLocalSave } from '../src/lib/storage';
import type { SaveState } from '../src/types';

/** Chaque route et un morceau de texte qui doit forcément apparaître. */
const ROUTES: { path: string; expect: string[]; label: string }[] = [
  { path: '/', label: 'Accueil', expect: ['Ryos'] },
  { path: '/quiz', label: 'Entraînement', expect: ['Mode de réponse'] },
  { path: '/examen', label: 'Examen Hokage', expect: ['Hokage'] },
  { path: '/party', label: 'Jeux à 4', expect: ['jeux'] },
  { path: '/duel', label: 'Duels', expect: ['duel'] },
  { path: '/kahoot', label: 'Kahoot', expect: ['Kahoot', 'PIN'] },
  { path: '/arcade', label: 'Arcade', expect: ['machine'] },
  { path: '/defis', label: 'Défis', expect: ['éfi'] },
  { path: '/badges', label: 'Badges', expect: ['badge'] },
  { path: '/grades', label: 'Grades', expect: ['grade'] },
  { path: '/classement', label: 'Classement', expect: ['lassement'] },
  { path: '/amis', label: 'Amis & joueurs', expect: ['ami'] },
  { path: '/creer', label: 'Mode créateur', expect: ['créer'] },
  { path: '/revision', label: 'Feuille à imprimer', expect: ['imprimer'] },
  { path: '/erreurs', label: 'Cahier d’erreurs', expect: ['erreurs'] },
  { path: '/profil', label: 'Profil', expect: ['Profil'] },
  { path: '/une-page-inexistante', label: 'Route inconnue (redirection)', expect: ['Ryos'] }
];

const problems: string[] = [];
const warnings: string[] = [];

// Capture des erreurs React (props invalides, rendu en boucle, etc.)
const originalError = console.error;
const originalWarn = console.warn;
console.error = (...args: unknown[]) => {
  warnings.push(String(args[0]).slice(0, 200));
};
console.warn = (...args: unknown[]) => {
  warnings.push(String(args[0]).slice(0, 200));
};

/** Sauvegarde de départ : un profil déjà configuré pour passer l'accueil. */
const seed = (): SaveState => {
  const save = defaultSave('Sasuke');
  save.profile.ryos = 8000;
  save.profile.elo = 1180;
  save.profile.grade = 'CM1';
  save.profile.difficulty = 'moyen';
  save.stats.questionsAnswered = 240;
  save.stats.correctAnswers = 190;
  save.stats.quizzesPlayed = 18;
  save.stats.examsTaken = 3;
  save.stats.bestExam = 14;
  save.stats.duelsWon = 4;
  save.stats.bestRun = 9;
  save.stats.subjectsPlayed = ['maths', 'francais', 'sciences'];
  save.stats.sheetsPrinted = 2;
  save.stats.errorsFixed = 6;
  save.badges = ['premier-pas', 'serie-5'];
  save.history = [
    {
      id: 'h_test',
      type: 'quiz',
      label: 'Mathématiques — CM1',
      correct: 7,
      total: 8,
      score: 7,
      max: 8,
      ryos: 84,
      at: Date.now()
    }
  ];
  writeLocalSave(save);
  return save;
};

const render = async (path: string): Promise<string> => {
  window.history.pushState({}, '', path);
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root | null = createRoot(container);
  await act(async () => {
    root!.render(React.createElement(App));
  });
  // Laisse passer les effets (timers, requêtes) avant de lire le résultat.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
  const text = container.textContent || '';
  await act(async () => {
    root!.unmount();
  });
  root = null;
  container.remove();
  return text;
};

/** Clique sur un bouton dont le texte contient `needle` et attend le rendu. */
const clickText = async (container: HTMLElement, needle: string): Promise<boolean> => {
  const buttons = [...container.querySelectorAll('button')] as HTMLButtonElement[];
  const target = buttons.find((b) => (b.textContent || '').toLowerCase().includes(needle.toLowerCase()));
  if (!target || target.disabled) return false;
  await act(async () => {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
  return true;
};

/** Monte l'application sur une route et renvoie le conteneur + une fonction de démontage. */
const mount = async (path: string) => {
  window.history.pushState({}, '', path);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(App));
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
  return {
    container,
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    }
  };
};

const report = (label: string, ok: boolean, detail = '') => {
  if (!ok) {
    problems.push(`${label} : ${detail || 'échec'}`);
    console.log(`❌ ${label.padEnd(30)} ${detail}`);
  } else {
    console.log(`✅ ${label.padEnd(30)} ${detail}`);
  }
};

/** 0. Première visite : l'onboarding doit apparaître, puis créer le profil. */
const interactionOnboarding = async () => {
  localStorage.clear();
  const { container, unmount } = await mount('/');
  const text = container.textContent || '';
  if (!text.includes('prénom de ninja')) {
    report('Onboarding : première visite', false, `écran d’accueil inattendu (${text.slice(0, 90)}…)`);
    await unmount();
    return;
  }
  report('Onboarding : première visite', true, '« Quel est ton prénom de ninja ? »');

  // Saisie du prénom
  const input = container.querySelector('input') as HTMLInputElement | null;
  if (!input) {
    report('Onboarding : saisie du prénom', false, 'aucun champ de saisie');
    await unmount();
    return;
  }
  await act(async () => {
    // React écoute "input" : on simule une vraie frappe.
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, 'Rayan');
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60));
  });

  // Étape 1 (classe) puis étape 2 (difficulté) puis "Commencer l'aventure"
  await clickText(container, 'Continuer');
  await clickText(container, 'Continuer');
  const started = await clickText(container, 'Commencer');
  const after = container.textContent || '';
  const onDashboard = started && /Ryos/.test(after);
  report('Onboarding : création du profil', onDashboard, onDashboard ? 'le tableau de bord s’affiche' : after.slice(0, 90));
  await unmount();
  seed();
};

/** 1. Lancer un quiz, répondre à la première question et voir la correction. */
const interactionQuiz = async () => {
  const { container, unmount } = await mount('/quiz');
  const started = await clickText(container, 'Lancer le quiz');
  if (!started) {
    report('Quiz : lancer une partie', false, 'bouton « Lancer le quiz » introuvable');
    await unmount();
    return;
  }
  const text = container.textContent || '';
  if (!/Question 1\//.test(text)) {
    report('Quiz : lancer une partie', false, `aucune question affichée (${text.slice(0, 80)}…)`);
    await unmount();
    return;
  }
  report('Quiz : lancer une partie', true, 'la 1re question s’affiche');

  // Clique sur la réponse A (premier choix) : la correction doit apparaître.
  const letterSpans = [...container.querySelectorAll('span')].filter((s) => (s.textContent || '').trim() === 'A');
  const choiceButton = letterSpans.map((s) => s.closest('button')).find(Boolean) as HTMLButtonElement | undefined;
  if (!choiceButton) {
    report('Quiz : répondre', false, 'aucun choix cliquable');
    await unmount();
    return;
  }
  await act(async () => {
    choiceButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
  const after = container.textContent || '';
  const corrected = /Bravo|Bonne réponse|La bonne réponse|💡/.test(after);
  report('Quiz : correction affichée', corrected, corrected ? 'explication visible' : after.slice(0, 90));
  await unmount();
};

/** 2. La feuille imprimable : le portail d'impression contient exercices + corrigé. */
const interactionSheet = async () => {
  const { unmount } = await mount('/revision');
  const printRoot = document.getElementById('print-root');
  const content = printRoot ? printRoot.textContent || '' : '';
  if (!printRoot) {
    report('Feuille : portail d’impression', false, '#print-root absent du document');
  } else if (!content.includes('Corrigé')) {
    report('Feuille : portail d’impression', false, `corrigé absent (${content.slice(0, 80)}…)`);
  } else {
    const count = (content.match(/\d+\. /g) || []).length;
    report('Feuille : exercices + corrigé', count >= 10, `${count} exercices générés`);
  }
  await unmount();
};

/** 3. Le cahier d'erreurs affiche bien une question ratée (semée dans la sauvegarde). */
const interactionErrors = async () => {
  const save = seed();
  save.errors = [
    {
      id: 'maths:7 x 8 = ?',
      question: {
        prompt: 'Combien font 7 × 8 ?',
        choices: ['56', '54', '63', '48'],
        answer: 0,
        explanation: '7 × 8 = 56.',
        subject: 'maths'
      },
      wrongCount: 2,
      seenCount: 0,
      fixedCount: 0,
      mastered: false,
      at: Date.now() - 86400000,
      lastAt: Date.now() - 3600000
    }
  ];
  writeLocalSave(save);

  const { container, unmount } = await mount('/erreurs');
  const text = container.textContent || '';
  const ok = text.includes('Combien font 7 × 8 ?') && /réviser/i.test(text);
  report('Cahier d’erreurs : contenu', ok, ok ? 'la question ratée est listée' : text.slice(0, 90));

  // Ouvrir la correction d'un clic
  const opened = await clickText(container, 'Combien font 7 × 8 ?');
  const after = container.textContent || '';
  report('Cahier d’erreurs : correction', opened && after.includes('56'), opened ? 'correction dépliée' : 'clic sans effet');
  await unmount();
};

const main = async () => {
  seed();
  console.log(`Rendu de ${ROUTES.length} pages dans un DOM virtuel…\n`);

  for (const route of ROUTES) {
    let text = '';
    try {
      text = await render(route.path);
    } catch (error) {
      problems.push(`${route.label} (${route.path}) : CRASH → ${String(error).slice(0, 220)}`);
      console.log(`❌ ${route.label.padEnd(30)} crash`);
      continue;
    }
    const missing = route.expect.filter((needle) => !text.toLowerCase().includes(needle.toLowerCase()));
    if (!text.trim()) {
      problems.push(`${route.label} (${route.path}) : page vide`);
      console.log(`❌ ${route.label.padEnd(30)} page vide`);
    } else if (missing.length) {
      problems.push(`${route.label} (${route.path}) : texte attendu absent → ${missing.join(', ')}`);
      console.log(`❌ ${route.label.padEnd(30)} contenu manquant : ${missing.join(', ')}`);
    } else {
      console.log(`✅ ${route.label.padEnd(30)} ${text.trim().length} caractères rendus`);
    }
  }

  // ------------------------- Tests d'interaction -------------------------
  console.log('\nInteractions :');
  await interactionOnboarding();
  await interactionQuiz();
  await interactionSheet();
  await interactionErrors();

  // Les erreurs React sont bloquantes, les simples avertissements sont signalés.
  const errors = warnings.filter(
    (w) => !/not implemented|componentWillReceiveProps|ReactDOMTestUtils|React Router Future Flag/i.test(w)
  );
  if (errors.length) {
    console.log(`\n⚠️  ${errors.length} message(s) console :`);
    [...new Set(errors)].slice(0, 10).forEach((w) => console.log('   •', w));
    problems.push(`${errors.length} message(s) console.error / warn`);
  }

  console.log(problems.length === 0 ? `\n✅ Les ${ROUTES.length} pages s'affichent correctement.` : `\n❌ ${problems.length} problème(s)`);
  console.error = originalError;
  console.warn = originalWarn;
  process.exit(problems.length === 0 ? 0 : 1);
};

void main();
