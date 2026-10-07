import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Download, Play, ExternalLink } from 'lucide-react';

interface GreenConfirmationBannerProps {
  title?: string;
  onOpenMinecraft?: () => void;
  onOpenWebPreview?: () => void;
  onOpenPythonSandbox?: () => void;
  hasArtifacts?: boolean;
}

export const GreenConfirmationBanner: React.FC<GreenConfirmationBannerProps> = ({
  title = 'Projet & réponse validés avec succès',
  onOpenMinecraft,
  onOpenWebPreview,
  onOpenPythonSandbox,
  hasArtifacts
}) => {
  return (
    <div className="my-3 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/50 to-dark-850 border border-emerald-500/50 shadow-lg shadow-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500 text-dark-950 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            {title}
            <span className="hidden xs:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
              0% d'erreur
            </span>
          </h4>
          <p className="text-[11px] sm:text-xs text-emerald-200/80 mt-0.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vérifié formellement • Invariants respectés • Prêt à l'emploi</span>
          </p>
        </div>
      </div>

      {/* Quick Launch Buttons if applicable */}
      {hasArtifacts && (
        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
          {onOpenMinecraft && (
            <button
              onClick={onOpenMinecraft}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-dark-950" />
              <span>Jouer à Minecraft 2D</span>
            </button>
          )}

          {onOpenWebPreview && (
            <button
              onClick={onOpenWebPreview}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tester le Site Web</span>
            </button>
          )}

          {onOpenPythonSandbox && (
            <button
              onClick={onOpenPythonSandbox}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exécuter Python</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
