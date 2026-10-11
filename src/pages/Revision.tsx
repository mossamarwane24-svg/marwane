import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Difficulty, GradeId, Question, SubjectId } from '../types';
import { buildQuiz } from '../data/questions';
import { DIFFICULTIES, GRADES, SUBJECTS, gradeLabel, subjectById } from '../data/grades';
import { SectionTitle } from '../components/ui';
import { useGame } from '../state/GameContext';
import { cx, todayKey } from '../lib/format';

type Format = 'qcm' | 'ecrit';

const LETTERS = ['A', 'B', 'C', 'D'];

/** Feuille de revision a imprimer, avec corrige pour les parents / enseignants. */
export const RevisionPage: React.FC = () => {
  const { save, bumpStat, toast } = useGame();
  const profile = save.profile;

  const [subject, setSubject] = useState<SubjectId | 'toutes'>('maths');
  const [grade, setGrade] = useState<GradeId>(profile.grade);
  const [difficulty, setDifficulty] = useState<Difficulty>(profile.difficulty);
  const [count, setCount] = useState(20);
  const [format, setFormat] = useState<Format>('qcm');
  const [seed, setSeed] = useState(0);
  const [title, setTitle] = useState('Entraînement ninja');

  const subjects: SubjectId[] = subject === 'toutes' ? SUBJECTS.map((s) => s.id) : [subject];

  const questions = useMemo<Question[]>(
    () => buildQuiz({ grade, difficulty, count, subjects }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grade, difficulty, count, subject, seed]
  );

  // Conteneur d'impression : c'est le seul element conserve a l'impression.
  const [printRoot, setPrintRoot] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    const existing = document.getElementById('print-root') as HTMLDivElement | null;
    const node = existing || document.createElement('div');
    node.id = 'print-root';
    node.style.display = 'none';
    if (!existing) document.body.appendChild(node);
    setPrintRoot(node);
    return () => {
      if (!existing && node.parentNode) node.parentNode.removeChild(node);
    };
  }, []);

  const print = () => {
    bumpStat('sheetsPrinted', 1);
    toast('Feuille prête : pense à imprimer aussi la page du corrigé !', 'reward', '🖨️');
    // Laisse le temps au rendu du portail avant d'ouvrir la boîte d'impression.
    setTimeout(() => window.print(), 120);
  };

  const header = (
    <div className="mb-4 border-b-2 border-current pb-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-black">🍥 Académie Ninja — {title}</div>
          <div className="text-sm">
            {subject === 'toutes' ? 'Toutes matières' : subjectById(subject).name} · {gradeLabel(grade)} ·{' '}
            {DIFFICULTIES.find((d) => d.id === difficulty)?.name} · {questions.length} questions
          </div>
        </div>
        <div className="text-right text-sm">
          <div>
            Prénom : <b>{profile.name}</b>
          </div>
          <div>Date : {todayKey()}</div>
          <div className="mt-1 text-base font-black">Note : ……… / {questions.length}</div>
        </div>
      </div>
    </div>
  );

  const sheet = (
    <div className="print-page">
      {header}
      {questions.map((q, i) => (
        <div key={`${q.id}-${i}`} className="print-question">
          <div className="font-bold">
            {i + 1}. {q.prompt}
          </div>
          {format === 'qcm' ? (
            <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {q.choices.map((c, ci) => (
                <div key={ci}>
                  ☐ {LETTERS[ci]}. {c}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-sm">Réponse : ________________________________</div>
          )}
        </div>
      ))}
      <div className="print-page-break" />
      <div className="mb-3 border-b-2 border-current pb-1 text-lg font-black">✅ Corrigé — {title}</div>
      <ol className="list-decimal pl-5 text-sm">
        {questions.map((q, i) => (
          <li key={`c-${q.id}-${i}`} className="mb-1">
            <b>{q.choices[q.answer]}</b>
            {q.explanation ? ` — ${q.explanation}` : ''}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs">
        Feuille générée par l’Académie Ninja pour {profile.name} ({gradeLabel(grade)}). Les questions suivent le niveau
        scolaire choisi.
      </p>
    </div>
  );

  return (
    <div className="grid gap-4">
      <div className="card">
        <h1 className="h1">🖨️ Feuille de révision à imprimer</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Espace parent / enseignant : génère une feuille d’exercices adaptée au niveau de l’élève, à imprimer, avec le
          corrigé sur une page séparée.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* ------------------------------ REGLAGES ------------------------------ */}
        <div className="grid content-start gap-3">
          <div className="card">
            <SectionTitle icon="📚" title="Matière" />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSubject('toutes')}
                className={cx(
                  'rounded-xl border p-2 text-sm font-bold',
                  subject === 'toutes' ? 'border-amber-400/70 bg-amber-500/20' : 'border-ninja-line bg-ninja-panel2/50'
                )}
              >
                🌈 Toutes
              </button>
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubject(s.id)}
                  className={cx(
                    'rounded-xl border p-2 text-sm font-bold',
                    subject === s.id ? 'border-amber-400/70 bg-amber-500/20' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="🎓" title="Niveau scolaire" />
            <div className="grid grid-cols-4 gap-1.5">
              {GRADES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGrade(g.id)}
                  className={cx(
                    'rounded-lg border px-1 py-1.5 text-xs font-bold',
                    grade === g.id ? 'border-amber-400/70 bg-amber-500/20' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="🎚️" title="Difficulté" />
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={cx(
                    'rounded-xl border p-2 text-sm font-bold',
                    difficulty === d.id ? 'border-amber-400/70 bg-amber-500/20' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  {d.emoji} {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="✍️" title="Format des réponses" subtitle="« QCM ou autre »" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'qcm' as Format, label: 'QCM', emoji: '🔘', desc: '4 réponses au choix' },
                { id: 'ecrit' as Format, label: 'À écrire', emoji: '✍️', desc: 'ligne à compléter' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={cx(
                    'rounded-xl border p-2 text-sm font-bold',
                    format === f.id ? 'border-amber-400/70 bg-amber-500/20' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  {f.emoji} {f.label}
                  <span className="block text-[10px] font-normal text-ninja-muted">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <SectionTitle icon="🔢" title="Nombre de questions" />
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 30].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={cx(
                    'rounded-xl border p-2 text-sm font-bold',
                    count === n ? 'border-amber-400/70 bg-amber-500/20' : 'border-ninja-line bg-ninja-panel2/50'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <label className="mt-3 block text-xs font-bold text-ninja-muted">
              Titre de la feuille
              <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} />
            </label>
          </div>

          <div className="grid gap-2">
            <button className="btn-primary" onClick={print}>
              🖨️ Imprimer la feuille
            </button>
            <button className="btn-ghost" onClick={() => setSeed((s) => s + 1)}>
              🎲 Nouvelle feuille
            </button>
          </div>
        </div>

        {/* ------------------------------ APERCU -------------------------------- */}
        <div className="card">
          <SectionTitle
            icon="👀"
            title="Aperçu"
            subtitle={`${questions.length} questions · le corrigé est sur la 2ᵉ page à l’impression`}
          />
          <div className="grid gap-3 rounded-xl border border-ninja-line bg-white/90 p-4 text-slate-900">
            <div className="border-b-2 border-slate-800 pb-2">
              <div className="text-lg font-black">🍥 Académie Ninja — {title}</div>
              <div className="text-sm">
                {subject === 'toutes' ? 'Toutes matières' : subjectById(subject).name} · {gradeLabel(grade)} ·{' '}
                {DIFFICULTIES.find((d) => d.id === difficulty)?.name}
              </div>
              <div className="text-sm">
                Prénom : <b>{profile.name}</b> · Date : {todayKey()} · Note : ……… / {questions.length}
              </div>
            </div>
            <ol className="grid gap-3 text-sm">
              {questions.slice(0, 6).map((q, i) => (
                <li key={`p-${q.id}-${i}`}>
                  <div className="font-bold">
                    {i + 1}. {q.prompt}
                  </div>
                  {format === 'qcm' ? (
                    <div className="mt-1 grid grid-cols-2 gap-x-6 text-slate-700">
                      {q.choices.map((c, ci) => (
                        <div key={ci}>☐ {LETTERS[ci]}. {c}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 text-slate-700">Réponse : ______________________</div>
                  )}
                </li>
              ))}
            </ol>
            <div className="rounded-lg bg-slate-100 p-2 text-xs text-slate-600">
              … et {Math.max(0, questions.length - 6)} autre(s) question(s) sur la feuille imprimée. Le corrigé complet
              figure en page 2.
            </div>
          </div>
        </div>
      </div>

      {/* Portail d'impression : invisible a l'ecran, seul rendu a l'impression. */}
      {printRoot && createPortal(sheet, printRoot)}
    </div>
  );
};
