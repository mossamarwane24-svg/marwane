import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText, Sparkles, Gamepad2, Globe, Terminal, Calculator } from 'lucide-react';
import { AttachedFile } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, files: AttachedFile[]) => void;
  isLoading: boolean;
  onQuickPrompt: (prompt: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onQuickPrompt
}) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;
    onSendMessage(input, attachedFiles);
    setInput('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');

      if (isImage) {
        reader.onload = (event) => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: 'file-' + Date.now() + Math.random(),
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: event.target?.result as string
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: 'file-' + Date.now() + Math.random(),
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: '',
              textContent: (event.target?.result as string)?.slice(0, 30000)
            }
          ]);
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-4">
      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => onQuickPrompt("Crée-moi le jeu Minecraft 2D complet avec les 6 blocs, arbres et physique !")}
          className="px-3 py-1.5 rounded-full bg-dark-850 hover:bg-dark-800 border border-emerald-500/30 text-emerald-400 font-medium whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>🎮 Minecraft 2D</span>
        </button>

        <button
          onClick={() => onQuickPrompt("Génère un site web SaaS ultra moderne et responsive avec dégradés néon et boutons fonctionnels")}
          className="px-3 py-1.5 rounded-full bg-dark-850 hover:bg-dark-800 border border-cyan-500/30 text-cyan-400 font-medium whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>🌐 Site Web Responsive</span>
        </button>

        <button
          onClick={() => onQuickPrompt("Écris et exécute en direct un script Python avec Matplotlib pour tracer une courbe harmonique")}
          className="px-3 py-1.5 rounded-full bg-dark-850 hover:bg-dark-800 border border-teal-500/30 text-teal-300 font-medium whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>🐍 Python & Matplotlib</span>
        </button>

        <button
          onClick={() => onQuickPrompt("Calcule exactement : 25 * 48 - sqrt(625) + 18 / 2")}
          className="px-3 py-1.5 rounded-full bg-dark-850 hover:bg-dark-800 border border-amber-500/30 text-amber-300 font-medium whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>📐 Calcul Exact</span>
        </button>

        <button
          onClick={() => onQuickPrompt("Explique-moi comment fonctionne le raisonnement neuro-symbolique hybride (Pilier 31)")}
          className="px-3 py-1.5 rounded-full bg-dark-850 hover:bg-dark-800 border border-indigo-500/30 text-indigo-300 font-medium whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>🧠 Pilier 31 Débat</span>
        </button>
      </div>

      {/* Main Input Box */}
      <div className="relative bg-dark-900 border border-dark-700 focus-within:border-emerald-500/60 rounded-2xl p-2 sm:p-3 shadow-xl transition-all">
        {/* Attached Files Previews */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-1">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-dark-800 border border-dark-700 text-xs text-slate-200"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 hover:text-red-400 text-slate-400 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl hover:bg-dark-800 text-slate-400 hover:text-slate-200 transition shrink-0"
            title="Joindre un fichier ou une image"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez n'importe quelle question, demandez du code, un calcul ou un jeu..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none max-h-44 py-2 leading-relaxed"
          />

          {/* Send button (Large and touch friendly) */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              (input.trim() || attachedFiles.length > 0) && !isLoading
                ? 'bg-emerald-500 hover:bg-emerald-400 text-dark-950 shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95'
                : 'bg-dark-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Envoyer (Entrée)"
          >
            <Send className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-center text-slate-500 mt-2">
        NEXUS-OMEGA Architecture 31-45 • 0% d'erreur certifié • Bac à sable 100% sécurisé
      </p>
    </div>
  );
};
