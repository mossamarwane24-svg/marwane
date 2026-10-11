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
import { defaultSave, loadLocalSave, writeLocalSave } from '../src/lib/storage';
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
  // On ignore les boutons désactivés (ex. « Jouer en ligne » sans serveur).
  const target = buttons.find(
    (b) => (b.textContent || '').toLowerCase().includes(needle.toLowerCase()) && !b.disabled
  );
  if (!target) return false;
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

/** Remplit un champ repere par son placeholder (saisie React compatible). */
const fillInput = async (container: HTMLElement, placeholder: string, value: string, nth = 0): Promise<boolean> => {
  const inputs = [...container.querySelectorAll('input')] as HTMLInputElement[];
  const matches = inputs.filter((i) => (i.placeholder || '').toLowerCase().includes(placeholder.toLowerCase()));
  const input = matches[nth];
  if (!input) return false;
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, value);
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  return true;
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

/** 4. Machine à sous : un tour doit coûter 50 Ryos et afficher un résultat. */
const interactionArcade = async () => {
  const spinsBefore = loadLocalSave()?.stats.slotSpins ?? 0;
  const before = loadLocalSave()?.profile.ryos ?? 0;
  const { container, unmount } = await mount('/arcade');
  const clicked = await clickText(container, 'Tourner');
  if (!clicked) {
    report('Arcade : machine à sous', false, 'bouton « Tourner » introuvable ou désactivé');
    await unmount();
    return;
  }
  // Le résultat tombe après l'animation des rouleaux.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2600));
  });
  const text = container.textContent || '';
  const hasResult = /Tu gagnes|Rien cette fois/.test(text);
  const spinsAfter = loadLocalSave()?.stats.slotSpins ?? 0;
  const after = loadLocalSave()?.profile.ryos ?? 0;
  const counted = spinsAfter > spinsBefore;
  report(
    'Arcade : tour de machine',
    hasResult && counted,
    hasResult && counted ? `résultat affiché, ${spinsAfter} tour(s) compté(s), solde ${before} → ${after}` : `résultat=${hasResult} tours=${spinsBefore}→${spinsAfter}`
  );
  await unmount();
};

/** 5. Un jeu à 4 contre les bots doit démarrer et avancer. */
const interactionParty = async () => {
  const { container, unmount } = await mount('/party');
  // Les boutons « Choisir » des jeux : on prend le premier jeu disponible.
  const started = (await clickText(container, 'Jouer tout de suite (bots)')) || (await clickText(container, '(bots)'));
  if (!started) {
    report('Jeux à 4 : lancer contre les bots', false, 'bouton de lancement introuvable');
    await unmount();
    return;
  }
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
  });
  // Démarre la manche si un bouton « Démarrer » est présent dans le salon.
  await clickText(container, 'Lancer la partie');
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2500));
  });
  const text = container.textContent || '';
  const running = /Manche|Question|Case|Tour de|Au tour de|score/i.test(text);
  report('Jeux à 4 : partie lancée', running, running ? 'la partie est en cours' : text.slice(0, 90));
  await unmount();
};

/** Compte les jetons poses sur la grille de Puissance 4. */
const countTokens = (container: HTMLElement) =>
  [...container.querySelectorAll('div.rounded-full')].filter((d) => (d.textContent || '').trim().length > 0).length;

/** 6. Puissance 4 : la partie se lance, on répond, le jeton tombe dans la colonne choisie. */
const interactionPuissance4 = async () => {
  const { container, unmount } = await mount('/party');
  const chosen = await clickText(container, 'Puissance 4 des Ninjas');
  const launched = await clickText(container, 'Jouer tout de suite (bots)');
  if (!chosen || !launched) {
    report('Puissance 4 : lancer la partie', false, `jeu choisi=${chosen} lancement=${launched}`);
    await unmount();
    return;
  }
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
  });
  const started = await clickText(container, 'Lancer la partie');
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  });
  const gridShown = /Aligne 4 jetons|colonne/i.test(container.textContent || '');
  report('Puissance 4 : grille affichée', started && gridShown, started && gridShown ? 'grille et colonnes prêtes' : `démarrage=${started} grille=${gridShown}`);

  // On répond à la question posée, puis on choisit une colonne.
  const choices = [...container.querySelectorAll('button')].filter((b) => /^[A-D]$|^[0-9]/.test((b.textContent || '').trim().slice(0, 1)));
  const answered = choices.length ? await clickText(container, (choices[0].textContent || '').trim().slice(0, 12)) : false;
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 900));
  });
  const colClicked = (await clickText(container, '↓ 3')) || (await clickText(container, '↓'));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 900));
  });
  const tokens = countTokens(container);
  report(
    'Puissance 4 : un jeton tombe dans la grille',
    tokens > 0,
    tokens > 0 ? `${tokens} jeton(s) posé(s) (réponse=${answered}, colonne cliquée=${colClicked})` : 'aucun jeton posé'
  );
  await unmount();
};

/** 7. Le mode créateur : validation, puis publication d'un jeu complet. */
const interactionCreator = async () => {
  const { container, unmount } = await mount('/creer');

  // 6a. Sans rien remplir, la validation doit bloquer la publication.
  const publishedEmpty = await clickText(container, 'Publier');
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  });
  const guardText = container.textContent || '';
  const guarded = publishedEmpty && /au moins|obligatoire|Il faut|titre/i.test(guardText);
  report('Créateur : validation', guarded, guarded ? 'publication refusée (formulaire incomplet)' : guardText.slice(0, 90));

  // 6b. On remplit un jeu complet : titre + 3 questions avec 4 réponses et explication.
  await fillInput(container, 'La chasse aux fractions', 'Test des fractions');
  for (let i = 0; i < 2; i++) {
    await clickText(container, 'Ajouter');
  }
  const total = (container.querySelectorAll('input') as NodeListOf<HTMLInputElement>).length;
  for (let i = 0; i < 3; i++) {
    await fillInput(container, 'Énoncé de la question', `Question de test ${i + 1}`, i);
    for (const letter of ['A', 'B', 'C', 'D']) {
      await fillInput(container, `Réponse ${letter}`, `Choix ${letter} de la question ${i + 1}`, i);
    }
    await fillInput(container, 'Explication', `Explication ${i + 1}`, i);
  }

  if (process.env.DEBUG_CREATOR) {
    const inputs = [...container.querySelectorAll('input')] as HTMLInputElement[];
    console.log('   DEBUG inputs:', inputs.length, inputs.slice(0, 4).map((i) => `[${i.placeholder}]=${i.value}`).join(' | '));
    const buttons = [...container.querySelectorAll('button')] as HTMLButtonElement[];
    console.log('   DEBUG boutons:', buttons.map((b) => (b.textContent || '').trim().slice(0, 18)).join(' / '));
  }
  const ryosBefore = loadLocalSave()?.profile.ryos ?? 0;
  const ok = await clickText(container, 'Publier');
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
  });
  const after = container.textContent || '';
  const ryosAfter = loadLocalSave()?.profile.ryos ?? 0;
  const published = ok && (ryosAfter <= ryosBefore - 4000 || /publié|Publié|bravo/i.test(after));
  report(
    'Créateur : publication',
    published,
    published ? `jeu publié (${ryosBefore} → ${ryosAfter} Ryos, ${total} champs)` : `DEBUG FIN: ${after.slice(-350)}`
  );
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
  await interactionArcade();
  await interactionParty();
  await interactionPuissance4();
  await interactionCreator();

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
