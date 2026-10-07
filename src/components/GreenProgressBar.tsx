import React, { useEffect, useState } from 'react';
import { Cpu, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface GreenProgressBarProps {
  currentStage: number; // 1 to 4
  stageLabel?: string;
}

export const GreenProgressBar: React.FC<GreenProgressBarProps> = ({ currentStage, stageLabel }) => {
  const [progress, setProgress] = useState(15);

  const stages = [
    { num: 1, label: 'Analyse neuro-symbolique', icon: Cpu },
    { num: 2, label: 'Débat des 7 agents', icon: Users },
    { num: 3, label: 'Vérification 0% erreur', icon: ShieldCheck },
    { num: 4, label: 'Génération et finalisation', icon: CheckCircle2 }
  ];

  useEffect(() => {
    const targetProgress = Math.min(100, currentStage * 25);
    setProgress(targetProgress);
  }, [currentStage]);

  return (
    <div className="w-full my-4 p-4 rounded-xl bg-dark-900 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-emerald-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{stageLabel || 'Traitement cognitif en cours...'}</span>
        </span>
        <span className="font-mono text-emerald-300 font-bold">{progress}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 rounded-full bg-dark-800 overflow-hidden relative border border-emerald-950">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-300 rounded-full shadow-sm shadow-emerald-500/50"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Stage checkpoints */}
      <div className="grid grid-cols-4 gap-1 pt-1">
        {stages.map((st) => {
          const isPassed = currentStage >= st.num;
          const isCurrent = currentStage === st.num;
          const Icon = st.icon;

          return (
            <div key={st.num} className="flex flex-col items-center text-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition ${
                  isPassed
                    ? 'bg-emerald-500 text-dark-950 font-bold shadow-sm shadow-emerald-500/40'
                    : 'bg-dark-800 text-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-[10px] mt-1 line-clamp-1 transition ${
                  isCurrent
                    ? 'text-emerald-400 font-bold'
                    : isPassed
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
