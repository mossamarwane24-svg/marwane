import React, { useState } from 'react';
import { generateMinecraft2DHTML } from '../utils/minecraft2d';
import { Download, ExternalLink, RefreshCw, X, Play, Gamepad2, Info } from 'lucide-react';

interface MinecraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeed?: number;
}

export const MinecraftModal: React.FC<MinecraftModalProps> = ({ isOpen, onClose, initialSeed }) => {
  const [seed, setSeed] = useState<number>(initialSeed || Math.floor(Math.random() * 1000000));
  const [key, setKey] = useState<number>(0);

  if (!isOpen) return null;

  const gameHtml = generateMinecraft2DHTML(seed);

  const handleOpenNewTab = () => {
    const blob = new Blob([gameHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const blob = new Blob([gameHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minecraft-2d-seed-${seed}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setSeed(newSeed);
    setKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-dark-900 border border-emerald-500/40 rounded-2xl flex flex-col shadow-2xl shadow-emerald-500/10 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-dark-850 border-b border-dark-700 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Minecraft 2D Pro <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">Procédural & Physique</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                6 blocs (Herbe, Terre, Pierre, Bois, Or, Eau) • Gravité • Arbres • Sans installation
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition border border-dark-600"
              title="Générer une nouvelle carte avec une graine aléatoire"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nouveau Monde</span>
            </button>

            <button
              onClick={handleOpenNewTab}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs text-dark-950 font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Ouvrir le jeu dans un nouvel onglet du navigateur"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ouvrir dans un nouvel onglet</span>
              <span className="sm:hidden">Nouvel onglet</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition border border-dark-600"
              title="Télécharger le fichier .html autonome pour jouer hors-ligne"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Télécharger (.html)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-400 hover:text-white transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game iframe */}
        <div className="flex-1 bg-black relative">
          <iframe
            key={key}
            srcDoc={gameHtml}
            className="w-full h-full border-0"
            title="Minecraft 2D Game Player"
            allow="fullscreen; autoplay"
          />
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-dark-850 border-t border-dark-700 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 text-emerald-400">
              <Play className="w-3 h-3 fill-emerald-400" /> Touches : Flèches / ZQSD pour bouger • Clic Gauche : Casser • Clic Droit : Poser
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline">Graine (Seed) : <strong className="text-slate-300 font-mono">{seed}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 60 FPS • 0% Latence
          </div>
        </div>
      </div>
    </div>
  );
};
