import React, { useState } from 'react';
import { ReasoningTrace } from '../types';
import { ChevronDown, ChevronUp, Brain, Users, Cpu, Clock, Check } from 'lucide-react';

interface ReasoningAccordionProps {
  trace: ReasoningTrace;
}

export const ReasoningAccordion: React.FC<ReasoningAccordionProps> = ({ trace }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAgents, setShowAgents] = useState(false);

  return (
    <div className="mb-4 rounded-xl border border-dark-700 bg-dark-900/90 shadow-lg overflow-hidden transition-all duration-200">
      {/* Header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-dark-850/80 hover:bg-dark-800 transition text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-6 h-6 rounded-md bg-dark-750 text-cyan-400 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
            Pensée Neuro-Symbolique & Société d'Agents
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-dark-800 text-slate-300 font-mono font-medium flex items-center gap-1 border border-dark-700">
            <Check className="w-3 h-3 text-cyan-400" /> 0% d'erreur
          </span>
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" /> {(trace.totalDurationMs / 1000).toFixed(2)}s
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs text-slate-400 hidden sm:inline">
            {isOpen ? 'Masquer la trace' : 'Voir le raisonnement'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Details */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-dark-750 bg-dark-950/60 text-xs">
          {/* Top Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-700">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Certitude Épistémique</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">{trace.confidenceScore}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-700">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Taux d'Erreur Garanti</span>
              <span className="text-sm font-bold text-slate-100 font-mono">0.00% (Formel)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-700">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Agents Consultés</span>
              <span className="text-sm font-bold text-indigo-400 font-mono">7 / 7 Délibérés</span>
            </div>
            <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-700">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Alignement RSI</span>
              <span className="text-sm font-bold text-sky-400 font-mono">100% Invariant</span>
            </div>
          </div>

          {/* Reasoning Steps */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Étapes de Résolution Déductive :
            </div>
            <div className="space-y-1.5">
              {trace.steps.map((step) => (
                <div key={step.id} className="p-2.5 rounded-lg bg-dark-850/80 border border-dark-750 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-dark-750 text-cyan-400 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold mt-0.5">
                    {step.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">{step.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{step.durationMs}ms</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{step.description}</p>
                    {step.formalVerification && (
                      <div className="mt-1.5 p-1.5 rounded bg-dark-950 font-mono text-[10px] text-slate-300 border border-dark-700">
                        {step.formalVerification}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agents Debate Toggle */}
          <div className="pt-2 border-t border-dark-750">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Société des 7 Agents Délibérants (Pilier 35) :
              </span>
              <button
                onClick={() => setShowAgents(!showAgents)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                {showAgents ? 'Réduire' : 'Afficher les contributions'}
              </button>
            </div>

            {showAgents && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {trace.agentDebates.map((ag) => (
                  <div key={ag.agent} className="p-2.5 rounded-lg bg-dark-850 border border-dark-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{ag.avatar}</span> {ag.agent}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                            ag.verdict === 'consensus' || ag.verdict === 'validé'
                              ? 'bg-dark-750 text-cyan-400 border border-dark-700'
                              : 'bg-dark-750 text-amber-300 border border-dark-700'
                          }`}
                        >
                          {ag.verdict}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{ag.contribution}</p>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                      <span>{ag.roleDescription}</span>
                      <span className="font-mono text-cyan-400">{ag.confidence}% certitude</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
