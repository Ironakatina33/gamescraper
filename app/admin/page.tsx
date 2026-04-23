'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Standalone admin page without AppShell to avoid ThemeProvider issues during build

interface RecentUpdate {
  id: string;
  title: string;
  source: string;
  slug: string;
  article_url: string;
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [stats, setStats] = useState({ updates: 0, details: 0, sources: 0 });
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [activeTab, setActiveTab] = useState<'actions' | 'stats' | 'recent'>('actions');

  // UI classes inline to avoid dependency issues
  const cardClass = 'rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md p-6 shadow-xl';
  const buttonPrimary = 'rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300';
  const buttonSecondary = 'rounded-xl bg-white/10 backdrop-blur-sm px-6 py-3 text-white font-semibold border border-white/20 hover:bg-white/20 disabled:opacity-50 transition-all duration-300';
  const buttonDanger = 'rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm px-6 py-3 text-red-300 font-semibold border border-red-400/30 hover:bg-red-500/30 disabled:opacity-50 transition-all duration-300';
  const sectionTitle = 'text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent';

  useEffect(() => {
    loadStats();
  }, []);

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
        setRecentUpdates(data.recent || []);
      }
    } catch {
      console.error('Erreur de chargement');
    }
  }

  function showMessage(msg: string, type: 'success' | 'error' = 'success') {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  }

  async function addSampleData() {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/seed');
      const data = await response.json();
      
      if (data.ok) {
        showMessage(`${data.data?.length || 0} jeux ajoutés avec succès`);
        loadStats();
      } else {
        showMessage(data.error || 'Erreur lors de l\'ajout', 'error');
      }
    } catch {
      showMessage('Erreur de connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function scrapeData() {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/sync', {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET || '14102004'}`
        }
      });
      const data = await response.json();
      
      if (data.ok) {
        showMessage(`${data.found || 0} jeux trouvés, ${data.inserted || 0} insérés`);
        loadStats();
      } else {
        showMessage(data.error || 'Erreur de scraping', 'error');
      }
    } catch {
      showMessage('Erreur de connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function scrapeDetails() {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/scrape-details', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.results) {
        const successCount = data.results.filter((r: {ok: boolean}) => r.ok).length;
        showMessage(`${successCount} détails scrapés avec succès`);
        loadStats();
      } else {
        showMessage('Erreur lors du scraping des détails', 'error');
      }
    } catch {
      showMessage('Erreur de connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function clearCache() {
    setIsLoading(true);
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('watchlist-games');
        localStorage.removeItem('watchlist-seen-by-slug');
        localStorage.removeItem('gamescraper-theme');
      }
      showMessage('Cache local effacé');
    } catch {
      showMessage('Erreur lors de l\'effacement du cache', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-lg">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h.01M6 14h.01" />
              </svg>
              GameScraper
            </Link>
            <span className="rounded-lg bg-[#66c0f4]/20 px-3 py-1 text-sm text-[#66c0f4]">
              Administration
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">Administration</h1>
          <p className="mt-1 text-[#8b98a5]">Gestion du site GameScraper</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 rounded-xl p-4 ${messageType === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className={cardClass}>
              <h2 className={sectionTitle}>Navigation</h2>
              <div className="mt-3 space-y-2">
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeTab === 'actions' ? 'bg-[#66c0f4] text-[#0b141b]' : 'bg-[#111821] text-white hover:bg-[#1a2838]'
                  }`}
                >
                  Actions
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeTab === 'stats' ? 'bg-[#66c0f4] text-[#0b141b]' : 'bg-[#111821] text-white hover:bg-[#1a2838]'
                  }`}
                >
                  Statistiques
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeTab === 'recent' ? 'bg-[#66c0f4] text-[#0b141b]' : 'bg-[#111821] text-white hover:bg-[#1a2838]'
                  }`}
                >
                  Données récentes
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <h3 className="text-sm font-semibold text-[#8b98a5]">Admin protégé</h3>
              <p className="mt-2 text-xs text-[#6f7c88]">
                Cette page est accessible uniquement avec le secret admin.
              </p>
            </div>

            <div className={cardClass}>
              <h3 className="text-sm font-semibold text-[#8b98a5]">Navigation rapide</h3>
              <div className="mt-2 space-y-1">
                <Link href="/" className="block text-sm text-[#66c0f4] hover:underline">Accueil</Link>
                <Link href="/updates" className="block text-sm text-[#66c0f4] hover:underline">Updates</Link>
                <Link href="/games" className="block text-sm text-[#66c0f4] hover:underline">Jeux</Link>
                <Link href="/watchlist" className="block text-sm text-[#66c0f4] hover:underline">Watchlist</Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section>
            {activeTab === 'actions' && (
              <div className="space-y-4">
                <div className={cardClass}>
                  <h2 className="text-xl font-bold text-white mb-4">Actions administrateur</h2>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={addSampleData}
                      disabled={isLoading}
                      className={buttonPrimary}
                    >
                      {isLoading ? 'Chargement...' : '🎮 Ajouter données d\'exemple'}
                    </button>
                    
                    <button
                      onClick={scrapeData}
                      disabled={isLoading}
                      className={buttonSecondary}
                    >
                      {isLoading ? 'Scraping...' : '🌐 Scraper game3rb.com'}
                    </button>

                    <button
                      onClick={scrapeDetails}
                      disabled={isLoading}
                      className={buttonSecondary}
                    >
                      {isLoading ? 'Scraping...' : '📄 Scraper les détails'}
                    </button>

                    <button
                      onClick={clearCache}
                      disabled={isLoading}
                      className={buttonDanger}
                    >
                      🗑️ Vider le cache local
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className={cardClass + ' text-center'}>
                    <p className="text-sm text-[#8b98a5]">Updates totales</p>
                    <p className="mt-2 text-4xl font-black text-[#66c0f4]">{stats.updates}</p>
                  </div>
                  <div className={cardClass + ' text-center'}>
                    <p className="text-sm text-[#8b98a5]">Détails scrapés</p>
                    <p className="mt-2 text-4xl font-black text-white">{stats.details}</p>
                  </div>
                  <div className={cardClass + ' text-center'}>
                    <p className="text-sm text-[#8b98a5]">Sources</p>
                    <p className="mt-2 text-4xl font-black text-white">{stats.sources}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recent' && (
              <div className={cardClass}>
                <h2 className="text-xl font-bold text-white mb-4">Données récentes</h2>
                {recentUpdates.length === 0 ? (
                  <p className="text-[#8b98a5]">Aucune donnée disponible.</p>
                ) : (
                  <div className="space-y-3">
                    {recentUpdates.slice(0, 10).map((update) => (
                      <div key={update.id} className="flex items-center justify-between border-b border-[#263241] pb-3 last:border-0">
                        <div>
                          <p className="font-semibold text-white">{update.title}</p>
                          <p className="text-sm text-[#8b98a5]">{update.source} • {update.slug}</p>
                        </div>
                        <a
                          href={update.article_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[#66c0f4] hover:underline"
                        >
                          Voir →
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
