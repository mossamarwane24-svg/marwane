import React, { useState } from 'react';
import { Message, ProjectArtifact } from '../types';
import { ReasoningAccordion } from './ReasoningAccordion';
import { GreenConfirmationBanner } from './GreenConfirmationBanner';
import {
  Copy,
  Check,
  Play,
  ExternalLink,
  Download,
  Terminal,
  Gamepad2,
  Globe,
  FileCode,
  FileText,
  User,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onOpenMinecraft: (seed?: number) => void;
  onOpenWebPreview: (html: string, title?: string) => void;
  onOpenPythonSandbox: (code?: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOpenMinecraft,
  onOpenWebPreview,
  onOpenPythonSandbox
}) => {
  const isAssistant = message.role === 'assistant';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to render markdown text with headings, bold, code blocks, lists
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n');
        const isPython = lang.toLowerCase() === 'python' || lang.toLowerCase() === 'py';
        const codeId = `code-${message.id}-${index}`;

        return (
          <div key={index} className="my-3 rounded-xl bg-dark-950 border border-dark-700 overflow-hidden shadow-lg">
            {/* Code Header Bar */}
            <div className="px-4 py-2 bg-dark-850 border-b border-dark-750 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-semibold uppercase">{lang || 'CODE'}</span>
              <div className="flex items-center gap-2">
                {isPython && (
                  <button
                    onClick={() => onOpenPythonSandbox(code)}
                    className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold flex items-center gap-1 transition"
                  >
                    <Play className="w-3 h-3 fill-dark-950" />
                    <span>▶ Exécuter Python</span>
                  </button>
                )}
                <button
                  onClick={() => handleCopy(code, codeId)}
                  className="px-2.5 py-1 rounded bg-dark-750 hover:bg-dark-700 text-slate-200 flex items-center gap-1 transition"
                >
                  {copiedCode === codeId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === codeId ? 'Copié' : 'Copier'}</span>
                </button>
                <button
                  onClick={() => handleDownloadFile(code, `code_${Date.now()}.${lang || 'txt'}`)}
                  className="px-2.5 py-1 rounded bg-dark-750 hover:bg-dark-700 text-slate-200 flex items-center gap-1 transition"
                  title="Télécharger ce fichier de code"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                </button>
              </div>
            </div>
            {/* Code Body */}
            <pre className="p-4 overflow-x-auto font-mono text-xs text-emerald-300 leading-relaxed selection:bg-emerald-500/30">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Regular markdown paragraphs, lists, bold text
      return (
        <div key={index} className="space-y-2 leading-relaxed text-sm text-slate-200">
          {part.split('\n\n').map((block, bIdx) => {
            if (block.startsWith('### ')) {
              return (
                <h3 key={bIdx} className="text-base sm:text-lg font-bold text-white mt-4 mb-2 flex items-center gap-2">
                  {block.replace('### ', '')}
                </h3>
              );
            }
            if (block.startsWith('#### ')) {
              return (
                <h4 key={bIdx} className="text-sm sm:text-base font-semibold text-emerald-400 mt-3 mb-1">
                  {block.replace('#### ', '')}
                </h4>
              );
            }
            if (block.startsWith('> ')) {
              return (
                <blockquote key={bIdx} className="my-2 pl-3 border-l-2 border-emerald-500 bg-emerald-950/20 p-2.5 rounded-r-lg text-slate-300 text-xs sm:text-sm">
                  {block.replace('> ', '')}
                </blockquote>
              );
            }
            if (block.startsWith('- ') || block.startsWith('* ')) {
              const items = block.split('\n');
              return (
                <ul key={bIdx} className="space-y-1 my-2 pl-2">
                  {items.map((item, itIdx) => (
                    <li key={itIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                      <span className="text-emerald-400 shrink-0">•</span>
                      <span dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^[\-\*]\s+/, '')) }} />
                    </li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\.\s/.test(block)) {
              const items = block.split('\n');
              return (
                <ol key={bIdx} className="space-y-1.5 my-2 pl-2">
                  {items.map((item, itIdx) => {
                    const match = item.match(/^(\d+)\.\s+(.*)/);
                    if (!match) return null;
                    return (
                      <li key={itIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <span className="font-mono text-emerald-400 font-bold shrink-0">{match[1]}.</span>
                        <span dangerouslySetInnerHTML={{ __html: formatInline(match[2]) }} />
                      </li>
                    );
                  })}
                </ol>
              );
            }

            return (
              <p key={bIdx} dangerouslySetInnerHTML={{ __html: formatInline(block) }} className="text-xs sm:text-sm text-slate-300" />
            );
          })}
        </div>
      );
    });
  };

  // Helper for bold, code inline, math
  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-dark-800 text-emerald-300 font-mono text-[11px] border border-dark-700">$1</code>');
  };

  const hasMinecraft = message.artifacts?.some(a => a.type === 'minecraft-2d');
  const hasWebsite = message.artifacts?.some(a => a.type === 'website');
  const hasPython = message.artifacts?.some(a => a.type === 'python-code');

  return (
    <div className={`py-4 sm:py-6 px-3 sm:px-6 transition-colors ${isAssistant ? 'bg-dark-950/40 border-y border-dark-800/60' : ''}`}>
      <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center font-black text-dark-950 text-sm shadow-md shadow-emerald-500/20">
              Ω
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header Role and Time */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-xs sm:text-sm text-white">
              {isAssistant ? 'NEXUS-OMEGA' : 'Vous'}
            </span>
            {isAssistant && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                Piliers 31-45
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Attached Files in User Message */}
          {message.attachedFiles && message.attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachedFiles.map((file) => (
                <div key={file.id} className="rounded-lg overflow-hidden border border-dark-700 bg-dark-900">
                  {file.type.startsWith('image/') && file.dataUrl ? (
                    <div className="max-w-xs max-h-48 overflow-hidden">
                      <img src={file.dataUrl} alt={file.name} className="w-full h-auto object-cover" />
                    </div>
                  ) : (
                    <div className="p-2.5 flex items-center gap-2 text-xs text-slate-300">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>{file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Assistant Reasoning Accordion (Visible trace before answer) */}
          {isAssistant && message.reasoningTrace && (
            <ReasoningAccordion trace={message.reasoningTrace} />
          )}

          {/* Green Confirmation Banner for completed projects */}
          {isAssistant && (hasMinecraft || hasWebsite || hasPython) && (
            <GreenConfirmationBanner
              title="Projet généré et testé sans erreur"
              hasArtifacts={true}
              onOpenMinecraft={hasMinecraft ? () => onOpenMinecraft() : undefined}
              onOpenWebPreview={
                hasWebsite
                  ? () => {
                      const site = message.artifacts?.find(a => a.type === 'website');
                      if (site) onOpenWebPreview(site.content, site.title);
                    }
                  : undefined
              }
              onOpenPythonSandbox={
                hasPython
                  ? () => {
                      const py = message.artifacts?.find(a => a.type === 'python-code');
                      onOpenPythonSandbox(py?.content);
                    }
                  : undefined
              }
            />
          )}

          {/* Formatted Content */}
          <div className="prose-dark">{renderFormattedContent(message.content)}</div>

          {/* Real Python execution result rendered right inside message */}
          {message.pythonExecResult && (
            <div className="mt-3 p-3 rounded-xl bg-dark-950 border border-emerald-500/30 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2 pb-1 border-b border-dark-800">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Terminal className="w-3.5 h-3.5" /> Résultat d'exécution en direct (Python 3.11)
                </span>
                <span>⏱️ {message.pythonExecResult.executionTimeMs} ms</span>
              </div>
              <pre className="text-emerald-300 whitespace-pre-wrap">{message.pythonExecResult.stdout}</pre>
              {message.pythonExecResult.plotImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-dark-700">
                  <img src={message.pythonExecResult.plotImage} alt="Python Plot" className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* Artifact Cards (Interactive buttons) */}
          {message.artifacts && message.artifacts.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {message.artifacts.map((art) => (
                <div
                  key={art.id}
                  className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 hover:border-emerald-500/50 transition flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {art.type === 'minecraft-2d' && <Gamepad2 className="w-4 h-4 text-emerald-400" />}
                      {art.type === 'website' && <Globe className="w-4 h-4 text-cyan-400" />}
                      {art.type === 'python-code' && <Terminal className="w-4 h-4 text-teal-400" />}
                      <span className="font-bold text-xs text-white">{art.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">{art.description}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-dark-750">
                    {art.type === 'minecraft-2d' && (
                      <button
                        onClick={() => onOpenMinecraft()}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-dark-950" />
                        <span>Jouer au Jeu</span>
                      </button>
                    )}

                    {art.type === 'website' && (
                      <button
                        onClick={() => onOpenWebPreview(art.content, art.title)}
                        className="flex-1 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Tester le Site</span>
                      </button>
                    )}

                    {art.type === 'python-code' && (
                      <button
                        onClick={() => onOpenPythonSandbox(art.content)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-dark-950" />
                        <span>Exécuter</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleDownloadFile(
                          art.content,
                          art.type === 'minecraft-2d'
                            ? 'minecraft-2d.html'
                            : art.type === 'website'
                            ? 'index.html'
                            : 'script.py'
                        )
                      }
                      className="p-1.5 rounded-lg bg-dark-750 hover:bg-dark-700 text-slate-300 transition"
                      title="Télécharger ce fichier"
                    >
                      <Download className="w-4 h-4 text-slate-400 hover:text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
