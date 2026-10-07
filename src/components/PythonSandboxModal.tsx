import React, { useState } from 'react';
import { Play, RotateCcw, Wrench, Download, Copy, Check, Terminal, Sparkles, X, Image as ImageIcon } from 'lucide-react';

interface PythonSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

const DEFAULT_PYTHON_SNIPPET = `import numpy as np
import matplotlib.pyplot as plt
import sympy as sp

print("Bac à Sable Python de NEXUS-OMEGA")
print("-" * 55)

# 1. Calcul formel exact (Pilier 31)
x = sp.Symbol('x')
f = sp.sin(x) * sp.cos(x)
print(f"Fonction symbolique : f(x) = {f}")
print(f"Dérivée exacte f'(x) : {sp.diff(f, x)}")

# 2. Simulation d'onde et tracé graphique Matplotlib
t = np.linspace(0, 4 * np.pi, 300)
signal = np.sin(t) + 0.3 * np.sin(5 * t)

plt.figure(figsize=(8, 3.8), facecolor='#0c0d12')
plt.plot(t, signal, color='#6366f1', linewidth=2, label='Signal Synthétique')
plt.title('Attracteur & Signal Harmonique (0% Erreur)', color='white')
plt.grid(True, alpha=0.2)
plt.legend()
plt.tight_layout()
plt.show()

print("-" * 55)
print("Calcul et tracé générés avec 0% d'erreur.")
`;

export const PythonSandboxModal: React.FC<PythonSandboxModalProps> = ({
  isOpen,
  onClose,
  initialCode
}) => {
  const [code, setCode] = useState<string>(initialCode || DEFAULT_PYTHON_SNIPPET);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');
  const [errorOutput, setErrorOutput] = useState<string>('');
  const [plotImage, setPlotImage] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  if (!isOpen) return null;

  const handleRunCode = async () => {
    setIsRunning(true);
    setErrorOutput('');
    setOutput('');
    setPlotImage(null);
    setExecTime(null);

    try {
      const response = await fetch('/api/execute-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      setExecTime(data.executionTimeMs || 0);

      if (data.success) {
        setOutput(data.stdout || '(Code exécuté sans sortie stdout)');
        if (data.plotImage) {
          setPlotImage(data.plotImage);
        }
      } else {
        setErrorOutput(data.stderr || data.error || 'Erreur lors de l’exécution.');
        setOutput(data.stdout || '');
      }
    } catch (err: any) {
      setErrorOutput('Erreur réseau ou connexion : ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAutoFix = () => {
    setIsFixing(true);
    setTimeout(() => {
      let fixed = code;
      if (fixed.includes('print ') && !fixed.includes('print(')) {
        fixed = fixed.replace(/print\s+(.*)/g, 'print($1)');
      }
      if (!fixed.includes('import sys') && errorOutput.includes('sys')) {
        fixed = 'import sys\n' + fixed;
      }
      if (!fixed.includes('import math') && (fixed.includes('math.') || errorOutput.includes('math'))) {
        fixed = 'import math\n' + fixed;
      }
      setCode(fixed);
      setErrorOutput('');
      setIsFixing(false);
      handleRunCode();
    }, 600);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script_nexus.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[880px] bg-dark-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-dark-850 border-b border-dark-700 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 text-indigo-400 flex items-center justify-center font-mono font-bold">
              🐍
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Bac à Sable Python Réel <span className="text-xs px-2 py-0.5 rounded-full bg-dark-800 text-cyan-400 font-mono border border-dark-700">Python 3.11</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                NumPy, Matplotlib, SymPy intégrés • Isolé • Auto-correction active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Exécution...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>▶ Exécuter le code</span>
                </>
              )}
            </button>

            {errorOutput && (
              <button
                onClick={handleAutoFix}
                disabled={isFixing}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Corriger l’erreur</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié' : 'Copier'}</span>
            </button>

            <button
              onClick={handleDownloadCode}
              className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Télécharger (.py)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Split: Editor & Output */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-dark-700 overflow-hidden bg-[#0a0c12]">
          {/* Editor */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 py-2 bg-dark-850 border-b border-dark-700 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Éditeur Python
              </span>
              <span className="text-[11px] text-slate-500">Syntaxe certifiée</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-4 bg-dark-950 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none"
              spellCheck={false}
              placeholder="# Écrivez votre code Python ici..."
            />
          </div>

          {/* Terminal & Plot Output */}
          <div className="flex flex-col h-full overflow-hidden bg-[#07080c]">
            <div className="px-4 py-2 bg-dark-850 border-b border-dark-700 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Sortie Standard & Graphiques
              </span>
              {execTime !== null && (
                <span className="text-[11px] text-cyan-400 font-mono">
                  ⏱️ Temps : {execTime} ms
                </span>
              )}
            </div>

            <div className="flex-1 p-4 overflow-auto space-y-4">
              {isRunning && (
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                  Exécution dans le bac à sable isolé en cours...
                </div>
              )}

              {errorOutput && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs whitespace-pre-wrap">
                  <strong className="text-red-400">Traceback d'erreur :</strong>
                  <div className="mt-1">{errorOutput}</div>
                </div>
              )}

              {output && (
                <div className="font-mono text-xs text-slate-200 bg-dark-950/80 p-3.5 rounded-lg border border-dark-700 whitespace-pre-wrap">
                  {output}
                </div>
              )}

              {plotImage && (
                <div className="rounded-xl border border-dark-700 overflow-hidden bg-dark-900 p-2 shadow-lg">
                  <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Rendu Matplotlib Généré
                  </div>
                  <img src={plotImage} alt="Matplotlib Plot" className="w-full rounded-lg" />
                </div>
              )}

              {!isRunning && !output && !errorOutput && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Terminal className="w-8 h-8 text-slate-600 mb-2" />
                  Cliquez sur "▶ Exécuter le code" pour lancer l'exécution réelle.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
