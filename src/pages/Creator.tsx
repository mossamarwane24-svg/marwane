import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../state/GameContext';
import { GRADES, SUBJECTS, subjectById } from '../data/grades';
import { api } from '../lib/api';
import { ProgressBar, SectionTitle, Tabs } from '../components/ui';
import { QuizRunner } from '../components/QuizRunner';
import { useQuizSession } from '../hooks/useQuizSession';
import { cx, formatDate, formatRyos } from '../lib/format';
import type { CustomGame, CustomQuestion, Difficulty, GradeId, Question, SubjectId } from '../types';

const PRICE = 5000;

const emptyQuestion = (): CustomQuestion => ({
  prompt: '',
  choices: ['', '', '', ''],
  answer: 0,
  explanation: ''
});

export const CreatorPage: React.FC = () => {
  const { profile, save, publishGame, communityGames, refreshCommunity, recordGame, toast } = useGame();
  const [tab, setTab] = useState<'atelier' | 'communaute' | 'mesjeux'>('atelier');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectId>('maths');
  const [grades, setGrades] = useState<GradeId[]>([profile.grade]);
  const [difficulty, setDifficulty] = useState<Difficulty>('moyen');
  const [questions, setQuestions] = useState<CustomQuestion[]>([emptyQuestion()]);
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState<CustomGame | null>(null);
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const recorded = useRef(false);

  useEffect(() => {
    void refreshCommunity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gameQuestions: Question[] = useMemo(
    () =>
      (playing?.questions || []).map((q, i) => ({
        id: `cg_${playing?.id}_${i}`,
        subject: (playing?.subject as SubjectId) || 'maths',
        band: 'elementaire' as const,
        level: 2 as const,
        prompt: q.prompt,
        choices: q.choices,
        answer: q.answer,
        explanation: q.explanation
      })),
    [playing]
  );

  const session = useQuizSession({
    questions: gameQuestions,
    difficulty: playing?.difficulty || 'moyen',
    ryosPerCorrect: 12,
    useTimer: save.settings.timer,
    onFinish: (s) => {
      if (recorded.current || !playing) return;
      recorded.current = true;
      recordGame({
        type: 'quiz',
        label: `${playing.title} (jeu de ${playing.authorName})`,
        subject: (playing.subject as SubjectId) || 'maths',
        correct: s.correct,
        total: s.total,
        baseRyos: s.ryos + 30,
        fromCommunity: playing.authorId !== profile.id,
        perfect: s.perfect
      });
      api.playGame(playing.id);
    }
  });

  const filteredCommunity = communityGames.filter((g) =>
    `${g.title} ${g.authorName} ${g.subject}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  const validation = useMemo(() => {
    if (title.trim().length < 3) return 'Donne un titre à ton jeu (3 lettres minimum).';
    if (questions.length < 3) return 'Il faut au moins 3 questions pour publier.';
    for (const [i, q] of questions.entries()) {
      if (q.prompt.trim().length < 4) return `Question ${i + 1} : écris l’énoncé.`;
      if (q.choices.some((c) => !c.trim())) return `Question ${i + 1} : remplis les 4 réponses.`;
      if (!q.explanation || !q.explanation.trim()) return `Question ${i + 1} : ajoute une explication (utile pour apprendre !).`;
    }
    return null;
  }, [title, questions]);

  const publish = async () => {
    if (validation) {
      toast(validation, 'error', '⚠️');
      return;
    }
    setBusy(true);
    const res = await publishGame({ title, subject, grades, difficulty, questions });
    setBusy(false);
    if (!res.ok) {
      toast(res.error || 'Publication impossible', 'error', '⚠️');
      return;
    }
    setPublished(true);
    setTitle('');
    setQuestions([emptyQuestion()]);
    setTab('mesjeux');
  };

  // ---------------------------------- Jeu ----------------------------------
  if (playing) {
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="h1">{playing.title}</h1>
            <p className="text-xs text-ninja-muted">
              par {playing.authorName} · {subjectById(playing.subject as SubjectId)?.name} · {playing.questions.length} questions
            </p>
          </div>
          <button
            className="btn-ghost"
            onClick={() => {
              setPlaying(null);
              recorded.current = false;
            }}
          >
            ← Retour
          </button>
        </div>

        {session.finished ? (
          <div className="card text-center">
            <div className="text-5xl">🎉</div>
            <h2 className="h2 mt-2">
              Score : {session.correct}/{gameQuestions.length}
            </h2>
            <p className="text-sm text-ninja-muted">
              +{session.ryos} Ryos (bonus +30 de la communauté) · meilleure série {session.bestRun}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                className="btn-primary"
                onClick={() => {
                  recorded.current = false;
                  session.restart();
                }}
              >
                🔁 Rejouer
              </button>
              <button className="btn-ghost" onClick={() => setPlaying(null)}>
                📋 Autres jeux
              </button>
            </div>
          </div>
        ) : session.current ? (
          <QuizRunner
            question={session.current}
            index={session.index}
            total={gameQuestions.length}
            selected={session.selected}
            revealed={session.revealed}
            secondsLeft={session.secondsLeft}
            secondsTotal={session.totalSeconds}
            correct={session.correct}
            wrong={session.wrong}
            streak={session.streak}
            answerCount={session.answers.length}
            onAnswer={session.choose}
            onTextAnswer={session.submitText}
            typedAnswer={session.typedAnswer}
            onNext={session.next}
            onSkip={session.skip}
            isLast={session.index + 1 >= gameQuestions.length}
          />
        ) : null}
      </div>
    );
  }

  const locked = profile.ryos < PRICE && !published;

  return (
    <div className="grid gap-5">
      <div className="card">
        <h1 className="h1">🛠️ Mode créateur</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Invente ton propre jeu de révision : questions, réponses, explications, niveaux. Publie-le pour toute la communauté et fais-le
          jouer à tes amis. <b>Prix de déblocage : {formatRyos(PRICE)} Ryos.</b>
        </p>
        <div className="mt-3">
          <ProgressBar value={Math.min(profile.ryos, PRICE)} max={PRICE} gradient="from-purple-500 to-fuchsia-400" />
          <div className="mt-1 text-xs text-ninja-muted">
            {profile.ryos >= PRICE
              ? '✅ Mode créateur débloqué ! (5 000 Ryos seront déduits à la première publication)'
              : `${formatRyos(PRICE - profile.ryos)} Ryos restants — gagne-les avec les quiz, duels et défis.`}
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'atelier', label: 'Créer un jeu', icon: '✏️' },
          { id: 'communaute', label: `Communauté (${communityGames.length})`, icon: '🌍' },
          { id: 'mesjeux', label: `Mes jeux (${save.customGames.length})`, icon: '📁' }
        ]}
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
      />

      {tab === 'atelier' && (
        <>
          {locked && (
            <div className="card">
              <SectionTitle icon="🔒" title="Mode créateur verrouillé" subtitle="Il te manque des Ryos" />
              <ul className="grid gap-1 text-sm text-ninja-muted">
                <li>📝 Quiz d’entraînement : 10 Ryos par bonne réponse (×2 en difficile)</li>
                <li>📜 Examen Hokage : 15 Ryos par bonne réponse</li>
                <li>🎲 Parties à 4 joueurs : 30 à 200 Ryos</li>
                <li>🎯 Défis quotidiens : jusqu’à 400 Ryos</li>
                <li>🏅 Badges : bonus immédiats</li>
              </ul>
              <p className="mt-3 text-xs text-amber-200">
                Astuce : enchaîne 4 quiz difficiles bien réussis et tu débloques le mode créateur !
              </p>
            </div>
          )}

          <div className="card">
            <SectionTitle icon="🎮" title="Fiche du jeu" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Titre du jeu</label>
                <input className="input" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : La chasse aux fractions" />
              </div>
              <div>
                <label className="label">Matière</label>
                <select className="input" value={subject} onChange={(e) => setSubject(e.target.value as SubjectId)}>
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.emoji} {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Difficulté</label>
                <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>
              <div>
                <label className="label">Classes visées (plusieurs possibles)</label>
                <div className="flex flex-wrap gap-1">
                  {GRADES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() =>
                        setGrades((prev) => (prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id]))
                      }
                      className={cx(
                        'rounded-lg border px-2 py-1 text-xs font-bold',
                        grades.includes(g.id) ? 'border-amber-400/70 bg-amber-500/20 text-amber-200' : 'border-ninja-line bg-ninja-panel2/50'
                      )}
                    >
                      {g.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <SectionTitle
              icon="❓"
              title={`Questions (${questions.length})`}
              subtitle="4 réponses possibles, la bonne est surlignée en vert"
              right={
                <button className="btn-ghost !py-1 text-xs" onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}>
                  ➕ Ajouter
                </button>
              }
            />
            <div className="grid gap-4">
              {questions.map((q, qi) => (
                <div key={qi} className="rounded-2xl border border-ninja-line bg-ninja-panel2/40 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="chip">Question {qi + 1}</span>
                    {questions.length > 1 && (
                      <button
                        className="btn-ghost ml-auto !px-2 !py-1 text-xs"
                        onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}
                      >
                        🗑️ Supprimer
                      </button>
                    )}
                  </div>
                  <input
                    className="input mb-2"
                    placeholder="Énoncé de la question…"
                    value={q.prompt}
                    onChange={(e) => setQuestions((prev) => prev.map((x, i) => (i === qi ? { ...x, prompt: e.target.value } : x)))}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.choices.map((c, ci) => (
                      <div key={ci} className="flex items-center gap-2">
                        <button
                          title="Marquer comme bonne réponse"
                          onClick={() => setQuestions((prev) => prev.map((x, i) => (i === qi ? { ...x, answer: ci } : x)))}
                          className={cx(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black',
                            q.answer === ci ? 'bg-emerald-400 text-slate-950' : 'bg-ninja-bg/70 text-ninja-muted'
                          )}
                        >
                          {['A', 'B', 'C', 'D'][ci]}
                        </button>
                        <input
                          className="input !py-2"
                          placeholder={`Réponse ${['A', 'B', 'C', 'D'][ci]}`}
                          value={c}
                          onChange={(e) =>
                            setQuestions((prev) =>
                              prev.map((x, i) => (i === qi ? { ...x, choices: x.choices.map((cc, j) => (j === ci ? e.target.value : cc)) } : x))
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <input
                    className="input mt-2 !py-2 text-sm"
                    placeholder="Explication (pourquoi cette réponse ?)"
                    value={q.explanation || ''}
                    onChange={(e) => setQuestions((prev) => prev.map((x, i) => (i === qi ? { ...x, explanation: e.target.value } : x)))}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="btn-primary" onClick={publish} disabled={busy}>
                {busy ? '…' : `🚀 Publier (−${formatRyos(PRICE)} Ryos)`}
              </button>
              <span className="text-xs text-ninja-muted">
                Ton solde : {formatRyos(profile.ryos)} Ryos {locked && '(il en faut 5 000)'}
              </span>
            </div>
            {validation && <p className="mt-2 text-xs text-amber-200">⏳ {validation}</p>}
          </div>
        </>
      )}

      {tab === 'communaute' && (
        <div className="card">
          <SectionTitle icon="🌍" title="Jeux de la communauté" subtitle="Joue à un jeu créé par un autre ninja (+30 Ryos bonus)" />
          <input className="input mb-3 max-w-sm" placeholder="🔎 Rechercher un jeu…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredCommunity.map((g) => (
              <div key={g.id} className="rounded-2xl border border-ninja-line bg-ninja-panel2/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-black">{g.title}</div>
                    <div className="text-[11px] text-ninja-muted">
                      par {g.authorName} · {subjectById(g.subject as SubjectId)?.name} · {g.questions.length} questions ·{' '}
                      {g.grades?.join(', ')}
                    </div>
                  </div>
                  <span className="chip">{g.difficulty}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="btn-primary !py-1.5 text-xs"
                    onClick={() => {
                      recorded.current = false;
                      setPlaying(g);
                      setTimeout(() => session.restart(), 20);
                    }}
                  >
                    ▶️ Jouer
                  </button>
                  <button
                    className="btn-ghost !py-1.5 text-xs"
                    onClick={() => {
                      api.likeGame(g.id);
                      toast('Merci pour le like ! ❤️', 'success', '❤️');
                    }}
                  >
                    ❤️ {g.likes}
                  </button>
                  <span className="text-[11px] text-ninja-muted">🎮 {g.plays} parties · {formatDate(g.createdAt)}</span>
                </div>
              </div>
            ))}
            {filteredCommunity.length === 0 && <p className="text-sm text-ninja-muted">Aucun jeu trouvé.</p>}
          </div>
        </div>
      )}

      {tab === 'mesjeux' && (
        <div className="card">
          <SectionTitle icon="📁" title="Mes jeux publiés" subtitle="Ils sont visibles par toute la communauté" />
          {save.customGames.length === 0 ? (
            <p className="text-sm text-ninja-muted">
              Aucun jeu publié pour l’instant. Crée ton premier jeu dans l’onglet « Créer un jeu » !
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {save.customGames.map((g) => (
                <div key={g.id} className="rounded-2xl border border-ninja-line bg-ninja-panel2/40 p-3">
                  <div className="font-black">{g.title}</div>
                  <div className="text-[11px] text-ninja-muted">
                    {g.questions.length} questions · {g.grades?.join(', ')} · publié le {formatDate(g.createdAt)}
                  </div>
                  <button
                    className="btn-primary mt-2 !py-1.5 text-xs"
                    onClick={() => {
                      recorded.current = false;
                      setPlaying(g);
                      setTimeout(() => session.restart(), 20);
                    }}
                  >
                    ▶️ Tester mon jeu
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
