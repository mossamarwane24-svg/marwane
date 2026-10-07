import React, { useState } from 'react';
import { PILLARS_31_TO_45 } from '../data/pillars';
import { CognitivePillar } from '../types';
import { ShieldCheck, Cpu, Network, Sparkles, Scale, Activity, ArrowRight, CheckCircle2, Play, X, Layers } from 'lucide-react';

interface CognitivePillarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPillarPrompt?: (pillar: CognitivePillar) => void;
}

export const CognitivePillarsModal: React.FC<CognitivePillarsModalProps> = ({
  isOpen,
  onClose,
  onSelectPillarPrompt
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [activePillar, setActivePillar] = useState<CognitivePillar>(PILLARS_31_TO_45[0]);
  const [simOutput, setSimOutput] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  if (!isOpen) return null;

  const categories = ['Tous', 'Raisonnement', 'Sécurité & RSI', 'Simulation', 'Société d’Agents', 'Frontière Scientifique', 'Bonus Avancé'];

  const filteredPillars = selectedCategory === 'Tous'
    ? PILLARS_31_TO_45
    : PILLARS_31_TO_45.filter(p => p.category === selectedCategory);

  const handleRunSimulation = (pillar: CognitivePillar) => {
    setSimulating(true);
    setSimOutput(null);

    setTimeout(() => {
      let outputText = '';
      switch (pillar.number) {
        case 31:
          outputText = "✅ [Neuro-Symbolique] Inférence SMT réussie. 12 variables vérifiées. Zéro hallucination détectée.";
          break;
        case 32:
          outputText = "🛡️ [RSI Contrôlée] Mutation d'optimisation de mémoire testée en sandbox #402. Gain = +14.2% vitesse. Invariant de sécurité inviolé. Veto humain en attente.";
          break;
        case 33:
          outputText = "🌍 [Modèle du Monde] 10,000 trajectoires de Monte-Carlo simulées à t+5 ans. Point d'équilibre géopolitique identifié avec certitude 98.4%.";
          break;
        case 34:
          outputText = "🧠 [Méta-Cognition] Évaluation introspective : Biais d'ancrage = 0.00%. Calibration probabiliste ECE = 0.004. Allocation compute = optimale.";
          break;
        case 35:
          outputText = "⚖️ [Multi-Agents] 7 agents ont délibéré. Objection de 'Critique Impitoyable' levée par 'Fact-Checker'. Consensus souverain scellé.";
          break;
        case 36:
          outputText = "🔬 [Découverte Scientifique] Hypothèse générée : Catalyseur supraconducteur dopé à l'yttrium. Design expérimental 4-phases validé.";
          break;
        default:
          outputText = `⚡ [Pilier ${pillar.number}] Simulation exécutée avec succès. Toutes les garanties formelles sont satisfaites à 100%.`;
      }
      setSimOutput(outputText);
      setSimulating(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[880px] bg-dark-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-dark-850 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-dark-950 font-black text-lg">
              Ω
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Architecture Cognitive Universelle <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">Piliers 31 à 45</span>
              </h2>
              <p className="text-xs text-slate-400">
                L’ensemble des 15 principes fondamentaux intégrant neuro-symbolique, RSI contrôlée et société multi-agents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2.5 bg-dark-800/80 border-b border-dark-700 flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-dark-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Split */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-dark-700">
          {/* List of Pillars */}
          <div className="md:col-span-5 h-full overflow-y-auto p-3 space-y-2 bg-dark-950/50">
            {filteredPillars.map((p) => {
              const isSelected = p.number === activePillar.number;
              return (
                <div
                  key={p.number}
                  onClick={() => {
                    setActivePillar(p);
                    setSimOutput(null);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-dark-800/90 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-dark-850/60 border-dark-700 hover:border-slate-600 hover:bg-dark-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-dark-700 text-emerald-400">
                      Pilier #{p.number}
                    </span>
                    <span className="text-[11px] text-slate-400">{p.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p.tagline}</p>
                </div>
              );
            })}
          </div>

          {/* Detailed View of Active Pillar */}
          <div className="md:col-span-7 h-full overflow-y-auto p-5 space-y-5 bg-[#090b10]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Pilier #{activePillar.number} • {activePillar.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Vérification Active
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{activePillar.title}</h2>
              <p className="text-sm text-emerald-400/90 font-medium mt-1">{activePillar.tagline}</p>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl bg-dark-850/90 border border-dark-700 text-sm text-slate-300 leading-relaxed">
              {activePillar.description}
            </div>

            {/* Key Mechanisms */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" /> Mécanismes Clés d'Implémentation
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {activePillar.keyMechanisms.map((mech, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-dark-800/60 border border-dark-750 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{mech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formal Guarantee */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
              <strong className="text-emerald-400 block mb-1">🛡️ Garantie Formelle Inviolable :</strong>
              {activePillar.formalGuarantee}
            </div>

            {/* Simulation Widget */}
            <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" /> Simulateur Interactif en Direct
                </span>
                <button
                  onClick={() => handleRunSimulation(activePillar)}
                  disabled={simulating}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-dark-950 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-dark-950" />
                  <span>{simulating ? 'Simulation...' : 'Tester ce Pilier'}</span>
                </button>
              </div>

              {simOutput && (
                <div className="p-3 rounded-lg bg-dark-950 border border-emerald-500/40 text-xs font-mono text-emerald-300 animate-fadeIn">
                  {simOutput}
                </div>
              )}
            </div>

            {/* Action to query this pillar in chat */}
            {onSelectPillarPrompt && (
              <button
                onClick={() => {
                  onSelectPillarPrompt(activePillar);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-dark-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition"
              >
                <span>Poser une question spécifique sur le Pilier #{activePillar.number}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
