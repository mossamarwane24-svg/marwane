import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../state/GameContext';
import { api, type PublicUserRow } from '../lib/api';
import { SectionTitle, StatBox, Tabs } from '../components/ui';
import { cx, formatRyos } from '../lib/format';
import { netEmit, onNet } from '../state/net';
import { gradeLabel } from '../data/grades';

export const FriendsPage: React.FC = () => {
  const { profile, friends, addFriend, acceptFriend, onlinePlayers, netStatus, onlineCount, toast, refreshFriends } = useGame();
  const [tab, setTab] = useState<'online' | 'search' | 'friends' | 'chat'>('online');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUserRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [messages, setMessages] = useState<Record<string, { id: string; text: string; mine: boolean; at: number }[]>>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [friendList, setFriendList] = useState<PublicUserRow[]>([]);

  useEffect(() => {
    const off = onNet<any>('chat:message', (m) => {
      const key = m.from === profile.id ? m.to : m.from;
      setMessages((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), { id: m.id, text: m.text, mine: m.from === profile.id, at: m.at }]
      }));
      if (m.from !== profile.id) toast(`💬 ${m.name} : ${m.text.slice(0, 60)}`, 'info', '💬');
    });
    return () => {
      off();
    };
  }, [profile.id, toast]);

  useEffect(() => {
    refreshFriends();
    void (async () => {
      const res = await api.friends(profile.id);
      if (res?.friends) setFriendList(res.friends);
    })();
    netEmit('friends:list');
    const off = onNet<any>('friends:list', (p) => {
      if (Array.isArray(p?.friends)) setFriendList(p.friends);
    });
    return () => {
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  const search = async () => {
    if (query.trim().length < 2) {
      toast('Tape au moins 2 lettres pour chercher un ninja.', 'error', '🔍');
      return;
    }
    setSearching(true);
    const rows = await api.searchUsers(query);
    setResults(rows.filter((r) => r.id !== profile.id));
    setSearching(false);
    if (!rows.length) toast('Aucun ninja trouvé avec ce nom.', 'info', '🔍');
  };

  const online = useMemo(() => onlinePlayers.filter((p) => p.id !== profile.id), [onlinePlayers, profile.id]);

  const send = () => {
    if (!activeChat || !draft.trim()) return;
    netEmit('chat:send', { to: activeChat, text: draft.trim() });
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), { id: `l${Date.now()}`, text: draft.trim(), mine: true, at: Date.now() }]
    }));
    setDraft('');
  };

  return (
    <div className="grid gap-5">
      <div className="card">
        <h1 className="h1">🫂 Amis & joueurs en ligne</h1>
        <p className="mt-1 text-sm text-ninja-muted">
          Cherche un ninja par son pseudo, envoie-lui une demande d’ami, discute en direct et défie-le en duel. La liste des joueurs
          connectés est mise à jour en temps réel.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon="📡" label="En ligne" value={netStatus === 'online' ? onlineCount : '—'} hint={netStatus === 'online' ? 'serveur actif' : 'hors ligne'} />
          <StatBox icon="🫂" label="Mes amis" value={friends.ids.length} />
          <StatBox icon="📨" label="Demandes reçues" value={friends.incoming.length} />
          <StatBox icon="📤" label="Envoyées" value={friends.outgoing.length} />
        </div>
      </div>

      {friends.incoming.length > 0 && (
        <div className="card">
          <SectionTitle icon="📨" title="Demandes d’ami en attente" />
          <div className="grid gap-2">
            {friends.incoming.map((f) => (
              <div key={f.from} className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3">
                <span className="text-2xl">{f.avatar || '🦊'}</span>
                <span className="flex-1 font-bold">{f.name}</span>
                <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => acceptFriend(f.from)}>
                  ✅ Accepter
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs
        tabs={[
          { id: 'online', label: 'En ligne', icon: '📡' },
          { id: 'search', label: 'Recherche', icon: '🔍' },
          { id: 'friends', label: 'Mes amis', icon: '🫂' },
          { id: 'chat', label: 'Messages', icon: '💬' }
        ]}
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
      />

      {tab === 'search' && (
        <div className="card">
          <SectionTitle icon="🔍" title="Barre de recherche" subtitle="Tape un pseudo pour envoyer une demande d’ami" />
          <div className="flex flex-wrap gap-2">
            <input
              className="input max-w-sm flex-1"
              placeholder="Ex : Lina, Adam, Maya…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <button className="btn-primary" onClick={search} disabled={searching}>
              {searching ? '…' : '🔍 Chercher'}
            </button>
          </div>
          <div className="mt-4 grid gap-2">
            {results.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-3">
                <span className="text-2xl">{r.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">
                    {r.name} {r.online && <span className="ml-1 h-2 w-2 inline-block rounded-full bg-emerald-400" />}
                  </div>
                  <div className="text-[11px] text-ninja-muted">
                    {gradeLabel(r.grade as never) || r.grade} · {formatRyos(r.ryos)} Ryos · ELO {r.elo}
                  </div>
                </div>
                {friends.ids.includes(r.id) ? (
                  <span className="chip !border-emerald-400/50 !text-emerald-200">déjà ami</span>
                ) : friends.outgoing.includes(r.id) ? (
                  <span className="chip">demande envoyée</span>
                ) : (
                  <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => addFriend(r.id)}>
                    ➕ Ajouter
                  </button>
                )}
              </div>
            ))}
            {results.length === 0 && !searching && <p className="text-sm text-ninja-muted">Lance une recherche pour trouver des ninjas.</p>}
          </div>
        </div>
      )}

      {tab === 'online' && (
        <div className="card">
          <SectionTitle
            icon="📡"
            title="Joueurs connectés"
            subtitle={netStatus === 'online' ? 'Mise à jour en direct' : 'Serveur hors ligne : lance npm run server pour voir les joueurs'}
          />
          {online.length === 0 ? (
            <p className="text-sm text-ninja-muted">
              Personne d’autre n’est connecté. Ouvre le site sur un autre appareil du même réseau, ou invite un ami avec le lien du site !
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {online.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-3">
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">{p.name}</div>
                    <div className="text-[11px] text-ninja-muted">
                      {p.status === 'playing' ? '🎮 en partie' : '🟢 disponible'} · ELO {p.elo}
                    </div>
                  </div>
                  <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => addFriend(p.id)}>
                    ➕ Ami
                  </button>
                  <button
                    className="btn-primary !px-3 !py-1.5 text-xs"
                    onClick={() => {
                      netEmit('duel:invite', { to: p.id, questions: [], maxRounds: 8 });
                      toast(`Défi envoyé à ${p.name} !`, 'success', '⚔️');
                    }}
                  >
                    ⚔️ Défier
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'friends' && (
        <div className="card">
          <SectionTitle icon="🫂" title={`Mes amis (${friendList.length || friends.ids.length})`} right={<button className="btn-ghost !py-1 text-xs" onClick={refreshFriends}>🔄</button>} />
          {(friendList.length ? friendList : []).length === 0 ? (
            <p className="text-sm text-ninja-muted">
              Aucun ami pour l’instant. Utilise la recherche pour envoyer des demandes — tes amis apparaîtront ici avec leur statut en
              ligne.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {friendList.map((f) => (
                <div key={f.id} className="flex items-center gap-2 rounded-xl border border-ninja-line bg-ninja-panel2/40 p-3">
                  <span className="text-2xl">{f.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">
                      {f.name} {f.online && <span className="ml-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />}
                    </div>
                    <div className="text-[11px] text-ninja-muted">
                      {gradeLabel(f.grade as never) || f.grade} · {formatRyos(f.ryos)} Ryos
                    </div>
                  </div>
                  <button
                    className="btn-ghost !px-3 !py-1.5 text-xs"
                    onClick={() => {
                      setActiveChat(f.id);
                      setTab('chat');
                    }}
                  >
                    💬
                  </button>
                  <button
                    className="btn-primary !px-3 !py-1.5 text-xs"
                    onClick={() => {
                      netEmit('duel:invite', { to: f.id, questions: [], maxRounds: 8 });
                      toast(`Défi envoyé à ${f.name} !`, 'success', '⚔️');
                    }}
                  >
                    ⚔️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
          <div className="card">
            <div className="label">Conversations</div>
            <div className="grid gap-1">
              {(friendList.length ? friendList : []).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveChat(f.id)}
                  className={cx(
                    'flex items-center gap-2 rounded-xl border p-2 text-left text-sm',
                    activeChat === f.id ? 'border-amber-400/60 bg-amber-500/15' : 'border-ninja-line bg-ninja-panel2/40'
                  )}
                >
                  <span className="text-lg">{f.avatar}</span>
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
              {friendList.length === 0 && <p className="text-xs text-ninja-muted">Ajoute des amis pour discuter.</p>}
            </div>
          </div>
          <div className="card flex min-h-[320px] flex-col">
            <div className="label">{activeChat ? `Message privé` : 'Choisis un ami à gauche'}</div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {(messages[activeChat || ''] || []).map((m) => (
                <div key={m.id} className={cx('max-w-[80%] rounded-2xl px-3 py-2 text-sm', m.mine ? 'ml-auto bg-amber-500/20' : 'bg-ninja-panel2/70')}>
                  {m.text}
                </div>
              ))}
              {activeChat && (messages[activeChat] || []).length === 0 && (
                <p className="text-xs text-ninja-muted">Aucun message. Dis bonjour ! 👋</p>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="input !py-2"
                placeholder={activeChat ? 'Écris un message…' : 'Sélectionne un ami'}
                value={draft}
                disabled={!activeChat}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button className="btn-primary" onClick={send} disabled={!activeChat}>
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
