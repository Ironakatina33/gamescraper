'use client';

import { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import { ui } from '../../lib/ui';
import { useToast } from '../components/ToastContext';

type GameUpdate = {
  id: string;
  title: string;
  slug: string;
  source: string;
  article_url: string;
  image_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
};

export default function AdminPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ updates: 0, details: 0, sources: 0 });
  const [recentUpdates, setRecentUpdates] = useState<GameUpdate[]>([]);
  const [scrapeUrl, setScrapeUrl] = useState('https://game3rb.com');
  const [activeTab, setActiveTab] = useState<'actions' | 'stats' | 'recent'>('actions');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Fetch real stats from Supabase via API
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
    } catch (error) {
      console.error('Erreur de chargement:', error);
    }
  }

  async function addSampleData() {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/seed');
      const data = await response.json();
      
      if (data.ok) {
        showSuccess(`${data.data?.length || 0} jeux ajoutés`);
        loadStats();
      } else {
        showError(data.error || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      showError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }

  async function scrapeData() {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/sync', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'demo-secret'}`
        }
      });
      const data = await response.json();
      
      if (data.ok) {
        showSuccess(`${data.found || 0} jeux trouvés, ${data.inserted || 0} insérés`);
        loadStats();
      } else {
        showError(data.error || 'Erreur de scraping');
      }
    } catch (error) {
      showError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }

  async function scrapeDetails() {
    setIsLoading(true);
    showInfo('Récupération des détails en cours...');
    
    try {
      const response = await fetch('/api/scrape-details', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.results) {
        const successCount = data.results.filter((r: {ok: boolean}) => r.ok).length;
        showSuccess(`${successCount} détails scrapés avec succès`);
        loadStats();
      } else {
        showError('Erreur lors du scraping des détails');
      }
    } catch (error) {
      showError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }

  async function clearCache() {
    setIsLoading(true);
    
    try {
      // Clear localStorage on client
      if (typeof window !== 'undefined') {
        localStorage.removeItem('watchlist-games');
        localStorage.removeItem('watchlist-seen-by-slug');
        localStorage.removeItem('gamescraper-theme');
      }
      showSuccess('Cache local effacé');
    } catch (error) {
      showError('Erreur lors de l\'effacement du cache');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell title="Administration" subtitle="Gestion du site GameScraper">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className={`${ui.card} p-4`}>
            <h2 className={ui.sectionTitle}>Navigation</h2>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setActiveTab('actions')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeTab === 'actions' ? 'bg-[#66c0f4] text-[#0b141b]' : 'bg-[#111b28] text-white hover:bg-[#1a2838]'
                }`}
              >
                Actions
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeTab === 'stats' ? 'bg-[#66c0f4] text-[#0b141b]' : 'bg-[#111b28] text-white hover:bg-[#1a2838]'
                }`}
              >
                Statistiques
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeTab === 'recent' ? 'bg-[#66c0f4] text-[#0b141b]' : 'bg-[#111b28] text-white hover:bg-[#1a2838]'
                }`}
              >
                Données récentes
              </button>
            </div>
          </div>

          <div className={`${ui.card} p-4`}>
            <h3 className="text-sm font-semibold text-[#8b98a5]">Admin protégé</h3>
            <p className="mt-2 text-xs text-[#6f7c88]">
              Cette page est accessible uniquement avec le secret admin.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <section>
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className={`${ui.card} p-5`}>
                <h2 className="text-xl font-bold text-white mb-4">Actions administrateur</h2>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={addSampleData}
                    disabled={isLoading}
                    className="rounded-xl bg-[#66c0f4] px-4 py-3 text-[#0b141b] font-semibold hover:bg-[#8fd3ff] disabled:opacity-50 transition"
                  >
                    {isLoading ? 'Chargement...' : '🎮 Ajouter données d\'exemple'}
                  </button>
                  
                  <button
                    onClick={scrapeData}
                    disabled={isLoading}
                    className="rounded-xl bg-[#223041] px-4 py-3 text-white font-semibold hover:bg-[#2d4055] disabled:opacity-50 transition"
                  >
                    {isLoading ? 'Scraping...' : '🌐 Scraper game3rb.com'}
                  </button>

                  <button
                    onClick={scrapeDetails}
                    disabled={isLoading}
                    className="rounded-xl bg-[#223041] px-4 py-3 text-white font-semibold hover:bg-[#2d4055] disabled:opacity-50 transition"
                  >
                    {isLoading ? 'Scraping...' : '📄 Scraper les détails'}
                  </button>

                  <button
                    onClick={clearCache}
                    disabled={isLoading}
                    className="rounded-xl bg-red-500/20 px-4 py-3 text-red-200 font-semibold hover:bg-red-500/30 disabled:opacity-50 transition"
                  >
                    🗑️ Vider le cache local
                  </button>
                </div>
              </div>

              <div className={`${ui.card} p-5`}>
                <h3 className="text-lg font-bold text-white mb-3">Configuration scraping</h3>
                <div className="space-y-3">
                  <div>
                    <label className={ui.label}>URL à scraper</label>
                    <input
                      type="text"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      className={ui.input}
                      placeholder="https://game3rb.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className={`${ui.card} p-5 text-center`}>
                  <p className="text-sm text-[#8b98a5]">Updates totales</p>
                  <p className="mt-2 text-4xl font-black text-[#66c0f4]">{stats.updates}</p>
                </div>
                <div className={`${ui.card} p-5 text-center`}>
                  <p className="text-sm text-[#8b98a5]">Détails scrapés</p>
                  <p className="mt-2 text-4xl font-black text-white">{stats.details}</p>
                </div>
                <div className={`${ui.card} p-5 text-center`}>
                  <p className="text-sm text-[#8b98a5]">Sources</p>
                  <p className="mt-2 text-4xl font-black text-white">{stats.sources}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className={`${ui.card} p-5`}>
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
    </AppShell>
  );
}
