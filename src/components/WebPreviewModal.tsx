import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, Smartphone, Tablet, Monitor, Code, Eye, Copy, Check, X, Globe, Sparkles } from 'lucide-react';
import { generateModernWebsite } from '../utils/webTemplates';

interface WebPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  title?: string;
}

export const WebPreviewModal: React.FC<WebPreviewModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  title = 'Aperçu du Site Web'
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [currentHtml, setCurrentHtml] = useState<string>('');
  const [activeTemplate, setActiveTemplate] = useState<'saas' | 'dashboard' | 'portfolio'>('saas');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (htmlContent && htmlContent.trim().length > 0) {
      setCurrentHtml(htmlContent);
    } else {
      setCurrentHtml(generateModernWebsite(title || 'Nexus Studio Pro', activeTemplate));
    }
  }, [htmlContent, isOpen, title, activeTemplate]);

  if (!isOpen) return null;

  const handleTemplateSwitch = (theme: 'saas' | 'dashboard' | 'portfolio') => {
    setActiveTemplate(theme);
    const newHtml = generateModernWebsite(title || 'Nexus Studio Pro', theme);
    setCurrentHtml(newHtml);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([currentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const blob = new Blob([currentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'index'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(currentHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[880px] bg-dark-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-dark-850 border-b border-dark-700 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {title} <span className="text-xs px-2 py-0.5 rounded-full bg-dark-800 text-cyan-400 font-mono border border-dark-750">Web Studio Pro</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Responsive • Dégradés modernes • Édition temps réel • Fichier autonome 1 clic
              </p>
            </div>
          </div>

          {/* Mode Toggles & Devices */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Template Switcher */}
            <div className="hidden md:flex bg-dark-800 rounded-lg p-0.5 border border-dark-700 text-xs">
              <button
                onClick={() => handleTemplateSwitch('saas')}
                className={`px-2.5 py-1 rounded-md transition ${activeTemplate === 'saas' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                SaaS
              </button>
              <button
                onClick={() => handleTemplateSwitch('dashboard')}
                className={`px-2.5 py-1 rounded-md transition ${activeTemplate === 'dashboard' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleTemplateSwitch('portfolio')}
                className={`px-2.5 py-1 rounded-md transition ${activeTemplate === 'portfolio' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Portfolio
              </button>
            </div>

            {/* View Tab */}
            <div className="flex bg-dark-800 rounded-lg p-0.5 border border-dark-700">
              <button
                onClick={() => setTab('preview')}
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                  tab === 'preview' ? 'bg-dark-650 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Aperçu</span>
              </button>
              <button
                onClick={() => setTab('code')}
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                  tab === 'code' ? 'bg-dark-650 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>Code HTML</span>
              </button>
            </div>

            {/* Device Switcher */}
            {tab === 'preview' && (
              <div className="hidden sm:flex bg-dark-800 rounded-lg p-0.5 border border-dark-700">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`p-1.5 rounded-md text-xs transition ${
                    device === 'desktop' ? 'bg-dark-650 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Vue Ordinateur (Plein écran)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`p-1.5 rounded-md text-xs transition ${
                    device === 'tablet' ? 'bg-dark-650 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Vue Tablette (768px)"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`p-1.5 rounded-md text-xs transition ${
                    device === 'mobile' ? 'bg-dark-650 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Vue Mobile Tactile (375px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Actions */}
            <button
              onClick={handleOpenNewTab}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              title="Tester dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ouvrir</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition border border-dark-600"
              title="Télécharger index.html prêt à l'emploi"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Télécharger</span>
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

        {/* Content Viewer: Split into Live Preview or Live Editable Code */}
        <div className="flex-1 bg-[#090b10] overflow-auto flex items-center justify-center p-2 sm:p-4">
          {tab === 'preview' ? (
            <div
              className={`h-full transition-all duration-300 rounded-xl overflow-hidden shadow-2xl bg-white border border-slate-700 ${
                device === 'desktop'
                  ? 'w-full'
                  : device === 'tablet'
                  ? 'w-[768px] max-w-full'
                  : 'w-[375px] max-w-full'
              }`}
            >
              <iframe
                srcDoc={currentHtml}
                className="w-full h-full border-0"
                title="Live Website Preview"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              />
            </div>
          ) : (
            <div className="w-full h-full max-w-5xl bg-dark-950 rounded-xl border border-dark-750 flex flex-col overflow-hidden">
              <div className="px-4 py-2 bg-dark-850 border-b border-dark-750 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Éditeur en Direct (Modifications instantanées)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded bg-dark-700 hover:bg-dark-600 text-slate-200 flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copié !' : 'Copier tout'}</span>
                  </button>
                </div>
              </div>
              <textarea
                value={currentHtml}
                onChange={(e) => setCurrentHtml(e.target.value)}
                className="flex-1 p-4 bg-dark-950 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
