'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ConfirmModal from '../components/ConfirmModal';

interface GameRow {
  id: string;
  title: string;
  slug: string;
  source: string;
  article_url: string;
  image_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
}

type TabId = 'actions' | 'stats' | 'games' | 'add';

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [stats, setStats] = useState({ updates: 0, details: 0, sources: 0 });
  const [activeTab, setActiveTab] = useState<TabId>('actions');

  // Games management state
  const [games, setGames] = useState<GameRow[]>([]);
  const [gamesTotal, setGamesTotal] = useState(0);
  const [gamesPage, setGamesPage] = useState(1);
  const [gamesTotalPages, setGamesTotalPages] = useState(1);
  const [gamesSearch, setGamesSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [gamesLoading, setGamesLoading] = useState(false);

  // Add game form
  const [addForm, setAddForm] = useState({
    title: '',
    source: 'Manual',
    article_url: '',
    image_url: '',
    summary: '',
  });

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmDanger, setConfirmDanger] = useState(false);

  const buttonPrimary = 'inline-flex items-center justify-center gap-2 bg-[#3e7bfa] px-5 py-3 text-sm font-medium text-white hover:bg-[#5b9eff] disabled:opacity-50 transition-colors';
  const buttonSecondary = 'inline-flex items-center justify-center gap-2 bg-transparent px-5 py-3 text-sm font-medium text-[#f5f5f7] border border-[#262732] hover:border-[#6a6b78] hover:bg-[#1a1b23] disabled:opacity-50 transition-colors';
  const buttonDanger = 'inline-flex items-center justify-center gap-2 bg-transparent px-5 py-3 text-sm font-medium text-[#ff5a5f] border border-[#ff5a5f]/30 hover:bg-[#ff5a5f]/10 disabled:opacity-50 transition-colors';
  const inputClass = 'w-full border border-[#262732] bg-[#0b0b10] px-4 py-3 text-sm text-[#f5f5f7] outline-none placeholder:text-[#6a6b78] focus:border-[#3e7bfa] transition-colors';

  useEffect(() => { loadStats(); }, []);

  const loadGames = useCallback(async (page = 1, search = '') => {
    setGamesLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', search });
      const res = await fetch(`/api/admin/games?${params}`);
      if (res.ok) {
        const data = await res.json();
        setGames(data.data ?? []);
        setGamesTotal(data.total ?? 0);
        setGamesPage(data.page ?? 1);
        setGamesTotalPages(data.totalPages ?? 1);
      }
    } catch { /* ignore */ }
    setGamesLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'games') loadGames(1, gamesSearch);
  }, [activeTab, loadGames, gamesSearch]);

  async function loadStats() {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          updates: data.updates || 0,
          details: data.details || 0,
          sources: data.sources || 0,
        });
      }
    } catch { /* ignore */ }
  }

  function showMsg(msg: string, type: 'success' | 'error' = 'success') {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  }

  function askConfirm(title: string, msg: string, action: () => void, danger = false) {
    setConfirmTitle(title);
    setConfirmMessage(msg);
    setConfirmDanger(danger);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  }

  async function scrapeData() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sync', {
        headers: { Authorization: `Bearer 14102004` },
      });
      const data = await res.json();
      if (data.ok) {
        showMsg(`${data.found || 0} jeux trouvés, ${data.inserted || 0} insérés`);
        loadStats();
      } else {
        showMsg(data.error || 'Erreur de scraping', 'error');
      }
    } catch { showMsg('Erreur de connexion', 'error'); }
    setIsLoading(false);
  }

  async function scrapeDetails() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/scrape-details');
      const data = await res.json();
      if (data.ok) {
        const count = data.success_count ?? 0;
        showMsg(`${count} détails scrapés avec succès`);
        loadStats();
      } else {
        showMsg(data.error || 'Erreur lors du scraping des détails', 'error');
      }
    } catch { showMsg('Erreur de connexion', 'error'); }
    setIsLoading(false);
  }

  async function addSampleData() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      if (data.ok) {
        showMsg(`${data.data?.length || 0} jeux ajoutés avec succès`);
        loadStats();
      } else {
        showMsg(data.error || 'Erreur lors de l\'ajout', 'error');
      }
    } catch { showMsg('Erreur de connexion', 'error'); }
    setIsLoading(false);
  }

  function clearCache() {
    askConfirm('Vider le cache', 'Efface la watchlist, le statut lu et le thème. Irréversible.', () => {
      localStorage.removeItem('watchlist-games');
      localStorage.removeItem('watchlist-seen-by-slug');
      localStorage.removeItem('gamescraper-theme');
      showMsg('Cache local effacé');
    }, true);
  }

  // ---- Games management ----
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === games.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(games.map(g => g.id)));
    }
  }

  function deleteSelected() {
    const count = selectedIds.size;
    if (count === 0) return;
    askConfirm(
      `Supprimer ${count} jeu${count > 1 ? 'x' : ''}`,
      `Cette action est irréversible. Les ${count} jeu${count > 1 ? 'x' : ''} sélectionné${count > 1 ? 's' : ''} et leurs détails seront supprimés.`,
      async () => {
        try {
          const res = await fetch('/api/admin/games', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedIds) }),
          });
          const data = await res.json();
          if (data.ok) {
            showMsg(`${data.deleted} jeu${data.deleted > 1 ? 'x' : ''} supprimé${data.deleted > 1 ? 's' : ''}`);
            setSelectedIds(new Set());
            loadGames(gamesPage, gamesSearch);
            loadStats();
          } else {
            showMsg(data.error || 'Erreur de suppression', 'error');
          }
        } catch { showMsg('Erreur de connexion', 'error'); }
      },
      true
    );
  }

  function deleteSingle(id: string, title: string) {
    askConfirm(
      'Supprimer ce jeu',
      `"${title}" sera supprimé définitivement.`,
      async () => {
        try {
          const res = await fetch('/api/admin/games', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [id] }),
          });
          const data = await res.json();
          if (data.ok) {
            showMsg('Jeu supprimé');
            setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            loadGames(gamesPage, gamesSearch);
            loadStats();
          } else {
            showMsg(data.error || 'Erreur', 'error');
          }
        } catch { showMsg('Erreur de connexion', 'error'); }
      },
      true
    );
  }

  async function handleAddGame(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.title.trim()) { showMsg('Titre requis', 'error'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.ok) {
        showMsg(`"${addForm.title}" ajouté avec succès`);
        setAddForm({ title: '', source: 'Manual', article_url: '', image_url: '', summary: '' });
        loadStats();
      } else {
        showMsg(data.error || 'Erreur', 'error');
      }
    } catch { showMsg('Erreur de connexion', 'error'); }
    setIsLoading(false);
  }

  const tabs: Array<{ id: TabId; label: string; num: string }> = [
    { id: 'actions', label: 'Actions', num: '01' },
    { id: 'games', label: 'Gestion des jeux', num: '02' },
    { id: 'add', label: 'Ajouter un jeu', num: '03' },
    { id: 'stats', label: 'Statistiques', num: '04' },
  ];

  return (
    <div
      className="min-h-screen bg-[#050507] text-[#f5f5f7]"
      style={{ fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#1a1b23] bg-[#050507]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] h-[62px] items-center justify-between gap-6 px-5 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="relative inline-block h-6 w-6">
              <span className="absolute inset-0 bg-[#3e7bfa]" />
              <span className="absolute inset-[3px] bg-[#050507]" />
              <span className="absolute inset-[7px] bg-[#5b9eff]" />
            </span>
            <span className="text-[15px] font-medium tracking-tight">gamescraper</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="mono text-[11px] uppercase tracking-[0.2em] text-[#ff5a5f] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a5f]" />
              Admin restricted
            </span>
            <Link href="/" className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] hover:text-[#f5f5f7] transition-colors">
              ↩ Exit
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-5 md:px-8">
        {/* Title block */}
        <div className="border-b border-[#1a1b23] grid gap-8 pt-12 pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#5b9eff] mb-4 flex items-center gap-3">
              <span className="inline-block h-[1px] w-8 bg-[#3e7bfa]" />
              Panneau · 00
            </p>
            <h1 className="text-[2rem] md:text-[2.6rem] font-medium tracking-[-0.02em] leading-[1.05]">
              Administration
            </h1>
            <p className="mt-3 text-[15px] text-[#a7a8b3] leading-relaxed max-w-prose">
              Déclenche des scrapes, gère les jeux, inspecte les stats.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-0 md:border-l md:border-[#1a1b23] md:pl-8 divide-x divide-[#1a1b23]">
            <AdminStat k="Updates" v={stats.updates} />
            <AdminStat k="Détails" v={stats.details} />
            <AdminStat k="Sources" v={stats.sources} />
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className={`mt-6 border flex items-stretch overflow-hidden ${messageType === 'success' ? 'border-[#1fd18c]/30 bg-[#1fd18c]/5' : 'border-[#ff5a5f]/30 bg-[#ff5a5f]/5'}`}>
            <div className={`w-1 ${messageType === 'success' ? 'bg-[#1fd18c]' : 'bg-[#ff5a5f]'}`} />
            <p className={`px-4 py-3 text-[13px] ${messageType === 'success' ? 'text-[#1fd18c]' : 'text-[#ff5a5f]'}`}>
              {messageType === 'success' ? '✓ ' : '✕ '}{message}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-10 flex items-center gap-0 border-b border-[#1a1b23] overflow-x-auto">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative px-4 py-3 text-[13px] whitespace-nowrap transition-colors ${active ? 'text-[#f5f5f7]' : 'text-[#6a6b78] hover:text-[#a7a8b3]'}`}
              >
                <span className="mono text-[10px] text-[#6a6b78] mr-2">{t.num}</span>
                {t.label}
                {active && <span className="absolute left-3 right-3 -bottom-[1px] h-[1px] bg-[#3e7bfa]" />}
              </button>
            );
          })}
        </div>

        <section className="mt-10 pb-20">
          {/* ===== ACTIONS TAB ===== */}
          {activeTab === 'actions' && (
            <div className="grid gap-0 md:grid-cols-2 border-t border-l border-[#1a1b23]">
              <ActionCard num="01" title="Scraper Game3Rb" body="Lance une passe complète sur game3rb.com et sauvegarde les nouveautés en base."
                button={<button onClick={scrapeData} disabled={isLoading} className={buttonPrimary}>{isLoading ? 'Scraping...' : 'Lancer le scrape ↗'}</button>} />
              <ActionCard num="02" title="Scraper les détails" body="Récupère pour chaque update les infos structurées (trailer, config, screenshots, liens)."
                button={<button onClick={scrapeDetails} disabled={isLoading} className={buttonSecondary}>{isLoading ? 'Scraping...' : 'Détails structurés'}</button>} />
              <ActionCard num="03" title="Seed de démo" body="Injecte des données d'exemple pour tester l'interface sans scraper."
                button={<button onClick={addSampleData} disabled={isLoading} className={buttonSecondary}>{isLoading ? 'Chargement...' : 'Ajouter seed'}</button>} />
              <ActionCard num="04" title="Cache local" body="Efface la watchlist + statut lu + thème stockés dans ce navigateur. Irréversible." danger
                button={<button onClick={clearCache} disabled={isLoading} className={buttonDanger}>Vider le cache</button>} />
            </div>
          )}

          {/* ===== GAMES MANAGEMENT TAB ===== */}
          {activeTab === 'games' && (
            <div>
              {/* Search + bulk actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={gamesSearch}
                    onChange={(e) => { setGamesSearch(e.target.value); setGamesPage(1); }}
                    placeholder="Rechercher par titre, slug, source..."
                    className={inputClass}
                  />
                  {gamesSearch && (
                    <button onClick={() => setGamesSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6b78] hover:text-[#f5f5f7]">
                      ×
                    </button>
                  )}
                </div>
                {selectedIds.size > 0 && (
                  <button onClick={deleteSelected} className={buttonDanger}>
                    Supprimer {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
                  </button>
                )}
              </div>

              {/* Stats bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1a1b23] mb-0">
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78]">
                  {gamesTotal} jeu{gamesTotal > 1 ? 'x' : ''} au total
                  {gamesSearch && <span className="text-[#5b9eff]"> · recherche active</span>}
                </p>
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78]">
                  Page {gamesPage}/{gamesTotalPages || 1}
                </p>
              </div>

              {gamesLoading ? (
                <div className="py-16 text-center">
                  <p className="mono text-[12px] uppercase tracking-[0.2em] text-[#6a6b78]">Chargement...</p>
                </div>
              ) : games.length === 0 ? (
                <div className="border border-dashed border-[#262732] p-12 text-center mt-6">
                  <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] mb-2">— Aucun jeu —</p>
                  <p className="text-[#a7a8b3]">Lance un scrape ou ajoute un jeu manuellement.</p>
                </div>
              ) : (
                <>
                  {/* Select all */}
                  <div className="flex items-center gap-3 py-3 border-b border-[#1a1b23]">
                    <button
                      onClick={toggleSelectAll}
                      className={`h-4 w-4 border flex items-center justify-center text-[10px] transition-colors ${selectedIds.size === games.length ? 'bg-[#3e7bfa] border-[#3e7bfa] text-white' : 'border-[#262732] text-transparent hover:border-[#6a6b78]'}`}
                    >
                      ✓
                    </button>
                    <span className="mono text-[11px] text-[#6a6b78] uppercase tracking-[0.15em]">
                      {selectedIds.size > 0 ? `${selectedIds.size} sélectionné${selectedIds.size > 1 ? 's' : ''}` : 'Tout sélectionner'}
                    </span>
                  </div>

                  {/* Game list */}
                  <ul className="divide-y divide-[#1a1b23]">
                    {games.map((game) => (
                      <li key={game.id} className="flex items-center gap-4 py-4 hover:bg-[#0b0b10] transition-colors -mx-3 px-3 group">
                        <button
                          onClick={() => toggleSelect(game.id)}
                          className={`h-4 w-4 border shrink-0 flex items-center justify-center text-[10px] transition-colors ${selectedIds.has(game.id) ? 'bg-[#3e7bfa] border-[#3e7bfa] text-white' : 'border-[#262732] text-transparent hover:border-[#6a6b78]'}`}
                        >
                          ✓
                        </button>
                        {game.image_url ? (
                          <div className="h-10 w-16 shrink-0 overflow-hidden border border-[#1a1b23] bg-[#0b0b10]">
                            <img src={game.image_url} alt="" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-16 shrink-0 border border-dashed border-[#262732] grid place-items-center">
                            <span className="mono text-[8px] text-[#6a6b78] uppercase">no img</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] text-[#f5f5f7] truncate">{game.title}</p>
                          <p className="mono text-[10px] uppercase tracking-[0.15em] text-[#6a6b78] mt-0.5">
                            <span className="text-[#5b9eff]">{game.source}</span> · {game.slug}
                            {game.published_at && (
                              <> · {new Date(game.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/game/${game.slug}`} className="mono text-[10px] uppercase tracking-[0.2em] text-[#a7a8b3] hover:text-[#5b9eff] px-2 py-1">
                            Voir ↗
                          </Link>
                          <button
                            onClick={() => deleteSingle(game.id, game.title)}
                            className="mono text-[10px] uppercase tracking-[0.2em] text-[#ff5a5f] hover:text-[#ff8a8e] px-2 py-1"
                          >
                            Suppr
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Pagination */}
                  {gamesTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1a1b23]">
                      <p className="mono text-[11px] text-[#6a6b78]">
                        Page {gamesPage} / {gamesTotalPages}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setGamesPage(p => Math.max(1, p - 1)); loadGames(gamesPage - 1, gamesSearch); }}
                          disabled={gamesPage <= 1}
                          className="mono text-[12px] px-3 py-2 border border-[#262732] text-[#a7a8b3] hover:bg-[#1a1b23] disabled:opacity-40 transition-colors"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => { setGamesPage(p => Math.min(gamesTotalPages, p + 1)); loadGames(gamesPage + 1, gamesSearch); }}
                          disabled={gamesPage >= gamesTotalPages}
                          className="mono text-[12px] px-3 py-2 border border-[#262732] text-[#a7a8b3] hover:bg-[#1a1b23] disabled:opacity-40 transition-colors"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ===== ADD GAME TAB ===== */}
          {activeTab === 'add' && (
            <div className="max-w-2xl">
              <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#5b9eff] mb-6 flex items-center gap-3">
                <span className="inline-block h-[1px] w-8 bg-[#3e7bfa]" />
                Ajouter un jeu manuellement
              </p>
              <form onSubmit={handleAddGame} className="space-y-5">
                <div>
                  <label className="block mono text-[11px] uppercase tracking-[0.15em] text-[#6a6b78] mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={addForm.title}
                    onChange={(e) => setAddForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Cyberpunk 2077 Patch 2.2"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block mono text-[11px] uppercase tracking-[0.15em] text-[#6a6b78] mb-2">
                      Source *
                    </label>
                    <input
                      type="text"
                      value={addForm.source}
                      onChange={(e) => setAddForm(f => ({ ...f, source: e.target.value }))}
                      placeholder="Ex: Game3Rb"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mono text-[11px] uppercase tracking-[0.15em] text-[#6a6b78] mb-2">
                      URL de l&apos;article
                    </label>
                    <input
                      type="url"
                      value={addForm.article_url}
                      onChange={(e) => setAddForm(f => ({ ...f, article_url: e.target.value }))}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mono text-[11px] uppercase tracking-[0.15em] text-[#6a6b78] mb-2">
                    URL de l&apos;image
                  </label>
                  <input
                    type="url"
                    value={addForm.image_url}
                    onChange={(e) => setAddForm(f => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://..."
                    className={inputClass}
                  />
                  {addForm.image_url && (
                    <div className="mt-3 h-32 w-52 overflow-hidden border border-[#1a1b23] bg-[#0b0b10]">
                      <img src={addForm.image_url} alt="Preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block mono text-[11px] uppercase tracking-[0.15em] text-[#6a6b78] mb-2">
                    Résumé
                  </label>
                  <textarea
                    value={addForm.summary}
                    onChange={(e) => setAddForm(f => ({ ...f, summary: e.target.value }))}
                    placeholder="Description courte du jeu ou de la mise à jour..."
                    rows={4}
                    className={`${inputClass} resize-y`}
                  />
                </div>
                <div className="pt-3 flex gap-3">
                  <button type="submit" disabled={isLoading || !addForm.title.trim()} className={buttonPrimary}>
                    {isLoading ? 'Ajout...' : 'Ajouter le jeu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm({ title: '', source: 'Manual', article_url: '', image_url: '', summary: '' })}
                    className={buttonSecondary}
                  >
                    Réinitialiser
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===== STATS TAB ===== */}
          {activeTab === 'stats' && (
            <div className="grid gap-0 md:grid-cols-3 border-t border-l border-[#1a1b23]">
              <BigStat label="Total updates" value={stats.updates} accent />
              <BigStat label="Détails scrapés" value={stats.details} />
              <BigStat label="Sources actives" value={stats.sources} />
            </div>
          )}
        </section>
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        danger={confirmDanger}
        confirmLabel={confirmDanger ? 'Supprimer' : 'Confirmer'}
        onConfirm={() => { setConfirmOpen(false); confirmAction?.(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function AdminStat({ k, v }: { k: string; v: number }) {
  return (
    <div className="px-5 first:pl-0 py-2">
      <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#6a6b78] mb-1.5">{k}</p>
      <p className="mono text-2xl text-[#f5f5f7]">{v.toString().padStart(3, '0')}</p>
    </div>
  );
}

function BigStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="p-8 border-b border-r border-[#1a1b23]">
      <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] mb-4">— {label}</p>
      <p className={`mono text-5xl md:text-6xl tracking-tight ${accent ? 'text-[#5b9eff]' : 'text-[#f5f5f7]'}`}>
        {value.toString().padStart(3, '0')}
      </p>
    </div>
  );
}

function ActionCard({ num, title, body, button, danger }: { num: string; title: string; body: string; button: React.ReactNode; danger?: boolean }) {
  return (
    <div className="border-r border-b border-[#1a1b23] p-6 md:p-8 flex flex-col gap-4">
      <p className={`mono text-[11px] uppercase tracking-[0.2em] ${danger ? 'text-[#ff5a5f]' : 'text-[#5b9eff]'}`}>— {num}</p>
      <h3 className="text-xl font-medium tracking-[-0.01em] leading-tight">{title}</h3>
      <p className="text-[14px] leading-relaxed text-[#a7a8b3] flex-1">{body}</p>
      <div>{button}</div>
    </div>
  );
}
