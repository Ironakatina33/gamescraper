'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

interface ScrapeGame {
  title: string;
  slug: string;
  image_url: string | null;
  article_url: string;
  published_at: string;
  is_new: boolean;
}

interface ScrapeResult {
  source: string;
  ok: boolean;
  found: number;
  new: number;
  error?: string;
  games: ScrapeGame[];
  duration: number;
}

interface ScrapeLog {
  id: string;
  source: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  games_found: number;
  games_new: number;
  error: string | null;
}

interface TopGame {
  slug: string;
  view_count: number;
}

type TabId = 'scrape' | 'stats' | 'games' | 'add';

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [stats, setStats] = useState({ updates: 0, details: 0, sources: 0 });
  const [activeTab, setActiveTab] = useState<TabId>('scrape');

  // Scrape results
  const [scrapeResults, setScrapeResults] = useState<ScrapeResult[]>([]);
  const [scrapeLogs, setScrapeLogs] = useState<ScrapeLog[]>([]);

  // Stats
  const [topGames, setTopGames] = useState<TopGame[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [sourceBreakdown, setSourceBreakdown] = useState<{ source: string; count: number }[]>([]);

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

  useEffect(() => { loadStats(); loadScrapeLogs(); loadDetailedStats(); }, []);

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
        setStats({ updates: data.updates || 0, details: data.details || 0, sources: data.sources || 0 });
        // Build source breakdown from recent data
        if (data.recent) {
          const map: Record<string, number> = {};
          (data.recent as any[]).forEach(r => { map[r.source] = (map[r.source] || 0) + 1; });
          setSourceBreakdown(Object.entries(map).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count));
        }
      }
    } catch { /* ignore */ }
  }

  async function loadScrapeLogs() {
    try {
      const res = await fetch('/api/admin/scrape-logs');
      if (res.ok) {
        const data = await res.json();
        setScrapeLogs(data.logs ?? []);
      }
    } catch { /* ignore */ }
  }

  async function loadDetailedStats() {
    try {
      const viewsRes = await fetch('/api/views?limit=10');
      if (viewsRes.ok) {
        const data = await viewsRes.json();
        setTopGames(data.top ?? []);
        setTotalViews((data.top ?? []).reduce((s: number, g: TopGame) => s + g.view_count, 0));
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

  async function runScrape(endpoint: string, sourceName: string) {
    setIsLoading(true);
    setLoadingSource(sourceName);
    const start = Date.now();
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const duration = Date.now() - start;
      if (data.ok) {
        const result: ScrapeResult = {
          source: data.source || sourceName,
          ok: true,
          found: data.found || 0,
          new: data.new || 0,
          games: data.games || [],
          duration,
        };
        setScrapeResults(prev => [result, ...prev]);
        showMsg(`${sourceName}: ${result.found} trouvés, ${result.new} nouveaux (${(duration / 1000).toFixed(1)}s)`);
        loadStats();
        loadScrapeLogs();
      } else {
        const result: ScrapeResult = { source: sourceName, ok: false, found: 0, new: 0, error: data.error, games: [], duration };
        setScrapeResults(prev => [result, ...prev]);
        showMsg(data.error || `Erreur ${sourceName}`, 'error');
      }
    } catch {
      setScrapeResults(prev => [{ source: sourceName, ok: false, found: 0, new: 0, error: 'Connexion échouée', games: [], duration: Date.now() - start }, ...prev]);
      showMsg('Erreur de connexion', 'error');
    }
    setIsLoading(false);
    setLoadingSource(null);
  }

  async function scrapeDetails() {
    setIsLoading(true);
    setLoadingSource('Détails');
    try {
      const res = await fetch('/api/scrape-details');
      const data = await res.json();
      if (data.ok) {
        showMsg(`${data.success_count ?? 0} détails scrapés avec succès`);
        loadStats();
      } else {
        showMsg(data.error || 'Erreur lors du scraping des détails', 'error');
      }
    } catch { showMsg('Erreur de connexion', 'error'); }
    setIsLoading(false);
    setLoadingSource(null);
  }

  async function fixSources() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/fix-sources', { method: 'POST' });
      const data = await res.json();
      if (data.ok) { showMsg(data.message || 'Sources normalisées'); loadStats(); }
      else { showMsg(data.error || 'Erreur', 'error'); }
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
    { id: 'scrape', label: 'Scraping', num: '01' },
    { id: 'stats', label: 'Statistiques', num: '02' },
    { id: 'games', label: 'Gestion des jeux', num: '03' },
    { id: 'add', label: 'Ajouter un jeu', num: '04' },
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
            <button
              onClick={handleLogout}
              className="mono text-[11px] uppercase tracking-[0.2em] text-[#ff5a5f] hover:text-[#ff8a8f] transition-colors"
            >
              Déconnexion
            </button>
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
          {/* ===== SCRAPE TAB ===== */}
          {activeTab === 'scrape' && (
            <div className="space-y-10">
              {/* Source cards */}
              <div className="grid gap-0 md:grid-cols-3 border-t border-l border-[#1a1b23]">
                <SourceCard
                  name="Game3Rb"
                  url="game3rb.com"
                  color="#3e7bfa"
                  loading={loadingSource === 'Game3Rb'}
                  disabled={isLoading}
                  onScrape={() => runScrape('/api/sync', 'Game3Rb')}
                />
                <SourceCard
                  name="IGG Games"
                  url="igg-games.com"
                  color="#f59e0b"
                  loading={loadingSource === 'IGG Games'}
                  disabled={isLoading}
                  onScrape={() => runScrape('/api/sync-igg', 'IGG Games')}
                />
                <div className="border-r border-b border-[#1a1b23] p-6 flex flex-col gap-3">
                  <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#6a6b78]">— Outils</p>
                  <button onClick={scrapeDetails} disabled={isLoading} className={`${buttonSecondary} text-xs`}>
                    {loadingSource === 'Détails' ? 'Scraping détails...' : 'Scraper les détails'}
                  </button>
                  <button onClick={fixSources} disabled={isLoading} className={`${buttonSecondary} text-xs`}>
                    Normaliser les sources
                  </button>
                  <button onClick={clearCache} disabled={isLoading} className={`${buttonDanger} text-xs`}>
                    Vider le cache local
                  </button>
                </div>
              </div>

              {/* Live results */}
              {scrapeResults.length > 0 && (
                <div>
                  <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] mb-4 flex items-center gap-3">
                    <span className="inline-block h-[1px] w-8 bg-[#1a1b23]" />
                    Derniers résultats · {scrapeResults.length}
                  </p>
                  <div className="space-y-4">
                    {scrapeResults.slice(0, 3).map((r, idx) => (
                      <div key={idx} className={`border ${r.ok ? 'border-[#1fd18c]/20 bg-[#1fd18c]/[0.02]' : 'border-[#ff5a5f]/20 bg-[#ff5a5f]/[0.02]'}`}>
                        {/* Result header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1b23]/50">
                          <div className="flex items-center gap-3">
                            <span className={`h-2 w-2 rounded-full ${r.ok ? 'bg-[#1fd18c]' : 'bg-[#ff5a5f]'}`} />
                            <span className="text-[14px] font-medium">{r.source}</span>
                            <span className="mono text-[11px] text-[#6a6b78]">{(r.duration / 1000).toFixed(1)}s</span>
                          </div>
                          <div className="flex items-center gap-4 mono text-[11px]">
                            <span className="text-[#a7a8b3]">{r.found} trouvés</span>
                            {r.new > 0 && <span className="text-[#1fd18c] font-medium">+{r.new} nouveaux</span>}
                            {r.error && <span className="text-[#ff5a5f]">{r.error}</span>}
                          </div>
                        </div>
                        {/* Game list */}
                        {r.games.length > 0 && (
                          <div className="max-h-[320px] overflow-y-auto">
                            {r.games.map((g, gi) => (
                              <div key={gi} className="flex items-center gap-3 px-5 py-2.5 border-b border-[#1a1b23]/30 last:border-b-0 hover:bg-[#0d0d12]">
                                {g.image_url ? (
                                  <img src={g.image_url} alt="" className="h-10 w-10 object-cover border border-[#1a1b23] shrink-0" />
                                ) : (
                                  <div className="h-10 w-10 border border-dashed border-[#262732] grid place-items-center shrink-0">
                                    <span className="text-[8px] text-[#6a6b78]">—</span>
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] text-[#f5f5f7] truncate">{g.title}</p>
                                  <p className="mono text-[10px] text-[#6a6b78] truncate">{g.slug}</p>
                                </div>
                                {g.is_new ? (
                                  <span className="mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 bg-[#1fd18c]/10 text-[#1fd18c] border border-[#1fd18c]/20 shrink-0">new</span>
                                ) : (
                                  <span className="mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 text-[#6a6b78] border border-[#262732] shrink-0">exists</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scrape history */}
              {scrapeLogs.length > 0 && (
                <div>
                  <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] mb-4 flex items-center gap-3">
                    <span className="inline-block h-[1px] w-8 bg-[#1a1b23]" />
                    Historique des scrapes
                  </p>
                  <div className="border-t border-l border-[#1a1b23]">
                    {scrapeLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center gap-4 px-5 py-3 border-b border-r border-[#1a1b23]">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-[#1fd18c]' : log.status === 'running' ? 'bg-[#f59e0b] animate-pulse' : 'bg-[#ff5a5f]'}`} />
                        <span className="text-[13px] font-medium w-24 shrink-0">{log.source}</span>
                        <span className="mono text-[11px] text-[#6a6b78] flex-1">
                          {new Date(log.started_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="mono text-[11px] text-[#a7a8b3]">{log.games_found} trouvés</span>
                        {log.games_new > 0 && <span className="mono text-[11px] text-[#1fd18c]">+{log.games_new}</span>}
                        {log.error && <span className="mono text-[10px] text-[#ff5a5f] truncate max-w-[200px]">{log.error}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <div className="space-y-10">
              {/* Big numbers */}
              <div className="grid gap-0 md:grid-cols-4 border-t border-l border-[#1a1b23]">
                <BigStat label="Total updates" value={stats.updates} accent />
                <BigStat label="Détails scrapés" value={stats.details} />
                <BigStat label="Sources actives" value={stats.sources} />
                <BigStat label="Vues totales" value={totalViews} accent />
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Top games by views */}
                <div>
                  <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] mb-4 flex items-center gap-3">
                    <span className="inline-block h-[1px] w-8 bg-[#1a1b23]" />
                    Top jeux par vues
                  </p>
                  <div className="border-t border-l border-[#1a1b23]">
                    {topGames.length === 0 ? (
                      <div className="border-r border-b border-[#1a1b23] p-8 text-center">
                        <p className="text-[13px] text-[#6a6b78]">Aucune vue enregistrée pour le moment</p>
                      </div>
                    ) : (
                      topGames.map((g, i) => {
                        const maxViews = topGames[0]?.view_count || 1;
                        const pct = Math.round((g.view_count / maxViews) * 100);
                        return (
                          <div key={g.slug} className="relative border-r border-b border-[#1a1b23] px-5 py-3 flex items-center gap-4 overflow-hidden">
                            <div className="absolute inset-0 bg-[#3e7bfa]/[0.04]" style={{ width: `${pct}%` }} />
                            <span className="relative mono text-[11px] text-[#6a6b78] w-5 text-right shrink-0">{i + 1}</span>
                            <Link href={`/game/${g.slug}`} className="relative text-[13px] text-[#f5f5f7] hover:text-[#5b9eff] transition-colors flex-1 truncate">{g.slug}</Link>
                            <span className="relative mono text-[12px] text-[#5b9eff] font-medium shrink-0">{g.view_count}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Source breakdown */}
                <div>
                  <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] mb-4 flex items-center gap-3">
                    <span className="inline-block h-[1px] w-8 bg-[#1a1b23]" />
                    Répartition par source
                  </p>
                  <div className="border-t border-l border-[#1a1b23]">
                    {sourceBreakdown.length === 0 ? (
                      <div className="border-r border-b border-[#1a1b23] p-8 text-center">
                        <p className="text-[13px] text-[#6a6b78]">Pas de données</p>
                      </div>
                    ) : (
                      sourceBreakdown.map((s) => {
                        const total = sourceBreakdown.reduce((sum, x) => sum + x.count, 0);
                        const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                        return (
                          <div key={s.source} className="relative border-r border-b border-[#1a1b23] px-5 py-4 overflow-hidden">
                            <div className="absolute inset-0 bg-[#f59e0b]/[0.04]" style={{ width: `${pct}%` }} />
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.source === 'IGGGames' ? '#f59e0b' : '#3e7bfa' }} />
                                <span className="text-[14px] font-medium">{s.source}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="mono text-[12px] text-[#a7a8b3]">{s.count} jeux</span>
                                <span className="mono text-[11px] text-[#6a6b78]">{pct}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
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

/* ──────────── Sub-components ──────────── */

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

function SourceCard({ name, url, color, loading, disabled, onScrape }: {
  name: string; url: string; color: string; loading: boolean; disabled: boolean; onScrape: () => void;
}) {
  return (
    <div className="border-r border-b border-[#1a1b23] p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-lg font-medium tracking-[-0.01em]">{name}</h3>
      </div>
      <p className="mono text-[11px] text-[#6a6b78]">{url}</p>
      <div className="flex-1" />
      <button
        onClick={onScrape}
        disabled={disabled}
        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white disabled:opacity-50 transition-all ${loading ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: loading ? `${color}99` : color }}
      >
        {loading ? (
          <>
            <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Scraping...
          </>
        ) : (
          <>Lancer le scrape ↗</>
        )}
      </button>
    </div>
  );
}
