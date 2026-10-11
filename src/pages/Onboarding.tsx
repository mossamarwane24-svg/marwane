import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVATARS, BANDS, DIFFICULTIES, GRADES } from '../data/grades';
import { RANKS } from '../data/ranks';
import { useGame } from '../state/GameContext';
import { cx } from '../lib/format';
import type { Difficulty, GradeId } from '../types';
import { sfx } from '../lib/sound';

export const Onboarding: React.FC = () => {
  const { createProfile, toast } = useGame();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [grade, setGrade] = useState<GradeId>('CE2');
  const [difficulty, setDifficulty] = useState<Difficulty>('moyen');

  const canNext = step === 0 ? name.trim().length >= 2 : true;

  const finish = () => {
    createProfile({ name: name.trim(), avatar, grade, difficulty });
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 text-center">
        <div className="text-5xl floaty">🍥</div>
        <h1 className="gradient-text mt-2 text-3xl font-black sm:text-4xl">Académie Ninja</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Apprends les maths et le français en gagnant des <b>Ryos</b>, grimpe les {RANKS.length} grades ninja, défie tes amis en
          ligne… et deviens Hokage !
        </p>
      </div>

      <div className="mb-4 flex items-center justify-center gap-2">
        {['Qui es-tu ?', 'Ton niveau', 'Ta difficulté'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cx(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-black',
                i <= step ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950' : 'border border-ninja-line bg-ninja-panel2 text-ninja-muted'
              )}
            >
              {i < step ? '✓' : i + 1}
            </div>
            {i < 2 && <div className={cx('h-0.5 w-6', i < step ? 'bg-amber-400' : 'bg-ninja-line')} />}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <div className="animate-slideUp">
            <h2 className="h2 mb-1">Quel est ton prénom de ninja ?</h2>
            <p className="mb-4 text-sm text-ninja-muted">Le parent peut aussi inscrire l’enfant avec son prénom.</p>
            <label className="label">Prénom ou pseudo</label>
            <input
              className="input"
              placeholder="Ex : Rayan"
              value={name}
              maxLength={18}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canNext && setStep(1)}
            />
            <div className="mt-4">
              <label className="label">Choisis ton avatar</label>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setAvatar(a);
                      sfx.click();
                    }}
                    className={cx(
                      'aspect-square rounded-xl border text-2xl transition',
                      avatar === a ? 'border-amber-400/80 bg-amber-500/20 scale-105' : 'border-ninja-line bg-ninja-panel2/50 hover:border-amber-400/40'
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-slideUp">
            <h2 className="h2 mb-1">Quelle est ta classe ?</h2>
            <p className="mb-4 text-sm text-ninja-muted">
              Les questions s’adaptent de la Maternelle (MS, GS) jusqu’au collège (6ème → 3ème).
            </p>
            {BANDS.map((band) => (
              <div key={band.id} className="mb-3">
                <div className="mb-1 text-xs font-black uppercase tracking-widest text-ninja-muted">
                  {band.emoji} {band.label}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {GRADES.filter((g) => g.band === band.id).map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setGrade(g.id);
                        sfx.click();
                      }}
                      className={cx(
                        'rounded-xl border p-3 text-left transition',
                        grade === g.id ? 'border-amber-400/80 bg-amber-500/15' : 'border-ninja-line bg-ninja-panel2/50 hover:border-amber-400/40'
                      )}
                    >
                      <div className="text-lg">{g.emoji}</div>
                      <div className="text-sm font-bold">{g.label}</div>
                      <div className="text-[11px] text-ninja-muted">{g.age}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="animate-slideUp">
            <h2 className="h2 mb-1">Quelle difficulté ?</h2>
            <p className="mb-4 text-sm text-ninja-muted">
              Plus c’est difficile, plus tu gagnes de Ryos (×1, ×1,5, ×2). Tu pourras changer à tout moment dans le profil.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDifficulty(d.id);
                    sfx.click();
                  }}
                  className={cx(
                    'rounded-xl border p-4 text-left transition',
                    difficulty === d.id ? 'border-amber-400/80 bg-amber-500/15' : 'border-ninja-line bg-ninja-panel2/50 hover:border-amber-400/40'
                  )}
                >
                  <div className="text-2xl">{d.emoji}</div>
                  <div className="font-bold">{d.name}</div>
                  <div className="text-[11px] text-ninja-muted">{d.desc}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-ninja-line bg-ninja-panel2/50 p-3 text-xs text-ninja-muted">
              🎯 Toutes tes parties sont enregistrées : Ryos, grade, badges, série de connexion et classement.
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          {step > 0 && (
            <button className="btn-ghost" onClick={() => setStep((s) => s - 1)}>
              ← Retour
            </button>
          )}
          {step < 2 ? (
            <button
              className="btn-primary flex-1"
              disabled={!canNext}
              onClick={() => {
                if (!canNext) {
                  toast('Écris au moins 2 lettres pour ton prénom !', 'error', '✍️');
                  return;
                }
                setStep((s) => s + 1);
                sfx.click();
              }}
            >
              Continuer →
            </button>
          ) : (
            <button className="btn-primary flex-1" onClick={finish}>
              🔥 Commencer l’aventure
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: '🪙', title: 'Ryos', text: 'Gagne ta monnaie ninja' },
          { icon: '🍥', title: `${RANKS.length} grades`, text: 'Aspirant → Hokage' },
          { icon: '🎲', title: 'Jeux à 4', text: 'Plateau, Kahoot, duels' },
          { icon: '🏅', title: 'Badges', text: 'Défis et récompenses' }
        ].map((f) => (
          <div key={f.title} className="card-soft text-center">
            <div className="text-2xl">{f.icon}</div>
            <div className="mt-1 text-sm font-bold">{f.title}</div>
            <div className="text-[11px] text-ninja-muted">{f.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
