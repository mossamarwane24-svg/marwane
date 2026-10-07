import React, { useState } from 'react';
import { Conversation } from '../types';
import {
  Plus,
  MessageSquare,
  Trash2,
  Gamepad2,
  Globe,
  Terminal,
  Cpu,
  Calculator,
  Search,
  Shield,
  X,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenMinecraft: () => void;
  onOpenWebStudio: () => void;
  onOpenPythonSandbox: () => void;
  onOpenCognitivePillars: () => void;
  onQuickMath: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpenMobile,
  onCloseMobile,
  onOpenMinecraft,
  onOpenWebStudio,
  onOpenPythonSandbox,
  onOpenCognitivePillars,
  onQuickMath
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-dark-900 border-r border-dark-750 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Close on Mobile */}
        <div className="p-4 border-b border-dark-750 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center font-black text-dark-950 text-base shadow-lg shadow-emerald-500/20">
              Ω
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                NEXUS-OMEGA <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">v45</span>
              </h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Neuro-Symbolique & 7 Agents
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-white lg:hidden"
            title="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ✏️ Nouveau Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-dark-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouveau chat</span>
          </button>
        </div>

        {/* Quick Launch Tools Bar */}
        <div className="px-3 pb-2 space-y-1">
          <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Applications & Moteurs
          </p>

          <button
            onClick={() => { onOpenMinecraft(); onCloseMobile(); }}
            className="w-full p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750 text-xs font-medium text-slate-200 flex items-center justify-between transition group"
          >
            <span className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>🎮 Minecraft 2D Procédural</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
          </button>

          <button
            onClick={() => { onOpenWebStudio(); onCloseMobile(); }}
            className="w-full p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750 text-xs font-medium text-slate-200 flex items-center justify-between transition group"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>🌐 Web Studio Responsive</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
          </button>

          <button
            onClick={() => { onOpenPythonSandbox(); onCloseMobile(); }}
            className="w-full p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750 text-xs font-medium text-slate-200 flex items-center justify-between transition group"
          >
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>🐍 Bac à Sable Python Réel</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
          </button>

          <button
            onClick={() => { onOpenCognitivePillars(); onCloseMobile(); }}
            className="w-full p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750 text-xs font-medium text-slate-200 flex items-center justify-between transition group"
          >
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>🧠 Piliers Cognitifs 31 à 45</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">15</span>
          </button>
        </div>

        {/* Search Conversations */}
        <div className="px-3 pt-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans l'historique..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-dark-850 border border-dark-750 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Conversations History List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Historique Sauvegardé</span>
            <span className="text-slate-600 font-mono">{filteredConversations.length}</span>
          </p>

          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              Aucune conversation trouvée.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }}
                  className={`group relative p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between ${
                    isActive
                      ? 'bg-dark-800 border border-emerald-500/40 text-white shadow-sm'
                      : 'hover:bg-dark-850 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-6">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-medium truncate">{conv.title}</span>
                  </div>

                  {/* Delete button (visible on hover or active) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition"
                    title="Supprimer cette discussion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="p-3 border-t border-dark-750 bg-dark-950/60">
          <div className="p-2.5 rounded-xl bg-dark-850/80 border border-dark-750 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="text-slate-300 font-semibold block">Données 100% Locales</span>
              <span className="text-slate-500">Aucun transfert serveur externe</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
