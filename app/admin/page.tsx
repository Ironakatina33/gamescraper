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

  // Inline UI classes — admin is standalone (no ThemeProvider dependency)
  const cardClass = 'border border-[#1a1b23] bg-[#0f1015] p-6';
  const buttonPrimary = 'inline-flex items-center justify-center gap-2 bg-[#3e7bfa] px-5 py-3 text-sm font-medium text-white hover:bg-[#5b9eff] disabled:opacity-50 transition-colors';
  const buttonSecondary = 'inline-flex items-center justify-center gap-2 bg-transparent px-5 py-3 text-sm font-medium text-[#f5f5f7] border border-[#262732] hover:border-[#6a6b78] hover:bg-[#1a1b23] disabled:opacity-50 transition-colors';
  const buttonDanger = 'inline-flex items-center justify-center gap-2 bg-transparent px-5 py-3 text-sm font-medium text-[#ff5a5f] border border-[#ff5a5f]/30 hover:bg-[#ff5a5f]/10 disabled:opacity-50 transition-colors';
  const sectionTitle = 'mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#6a6b78]';

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

  const tabs: Array<{ id: typeof activeTab; label: string; num: string }> = [
    { id: 'actions', label: 'Actions', num: '01' },
    { id: 'stats', label: 'Statistiques', num: '02' },
    { id: 'recent', label: 'Données récentes', num: '03' },
  ];

  return (
    <div
      className="min-h-screen bg-[#050507] text-[#f5f5f7]"
      style={{
        fontFamily:
          "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
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
            <Link
              href="/"
              className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] hover:text-[#f5f5f7] transition-colors"
            >
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
              Déclenche des scrapes, inspecte les stats, supervise la base.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-0 md:border-l md:border-[#1a1b23] md:pl-8 divide-x divide-[#1a1b23]">
            <AdminStat k="Updates" v={stats.updates} />
            <AdminStat k="Détails" v={stats.details} />
            <AdminStat k="Sources" v={stats.sources} />
          </div>
        </div>

        {/* Toast message */}
        {message && (
          <div
            className={`mt-6 border flex items-stretch overflow-hidden ${
              messageType === 'success'
                ? 'border-[#1fd18c]/30 bg-[#1fd18c]/5'
                : 'border-[#ff5a5f]/30 bg-[#ff5a5f]/5'
            }`}
          >
            <div
              className={`w-1 ${messageType === 'success' ? 'bg-[#1fd18c]' : 'bg-[#ff5a5f]'}`}
            />
            <p
              className={`px-4 py-3 text-[13px] ${
                messageType === 'success' ? 'text-[#1fd18c]' : 'text-[#ff5a5f]'
              }`}
            >
              {messageType === 'success' ? '✓ ' : '✕ '}
              {message}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-10 flex items-center gap-0 border-b border-[#1a1b23]">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative px-4 py-3 text-[13px] transition-colors ${
                  active
                    ? 'text-[#f5f5f7]'
                    : 'text-[#6a6b78] hover:text-[#a7a8b3]'
                }`}
              >
                <span className="mono text-[10px] text-[#6a6b78] mr-2">
                  {t.num}
                </span>
                {t.label}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-[1px] h-[1px] bg-[#3e7bfa]" />
                )}
              </button>
            );
          })}
        </div>

        <section className="mt-10 pb-20">
          {activeTab === 'actions' && (
            <div className="grid gap-0 md:grid-cols-2 border-t border-l border-[#1a1b23]">
              <ActionCard
                num="01"
                title="Scraper Game3Rb"
                body="Lance une passe complète sur game3rb.com et sauvegarde les nouveautés en base."
                button={
                  <button onClick={scrapeData} disabled={isLoading} className={buttonPrimary}>
                    {isLoading ? 'Scraping...' : 'Lancer le scrape ↗'}
                  </button>
                }
              />
              <ActionCard
                num="02"
                title="Scraper les détails"
                body="Récupère pour chaque update les infos structurées (trailer, config, screenshots, liens)."
                button={
                  <button onClick={scrapeDetails} disabled={isLoading} className={buttonSecondary}>
                    {isLoading ? 'Scraping...' : 'Détails structurés'}
                  </button>
                }
              />
              <ActionCard
                num="03"
                title="Seed de démo"
                body="Injecte des données d'exemple pour tester l'interface sans scraper."
                button={
                  <button onClick={addSampleData} disabled={isLoading} className={buttonSecondary}>
                    {isLoading ? 'Chargement...' : 'Ajouter seed'}
                  </button>
                }
              />
              <ActionCard
                num="04"
                title="Cache local"
                body="Efface la watchlist + statut lu + thème stockés dans ce navigateur. Irréversible."
                danger
                button={
                  <button onClick={clearCache} disabled={isLoading} className={buttonDanger}>
                    Vider le cache
                  </button>
                }
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid gap-0 md:grid-cols-3 border-t border-l border-[#1a1b23]">
              <BigStat label="Total updates" value={stats.updates} accent />
              <BigStat label="Détails scrapés" value={stats.details} />
              <BigStat label="Sources actives" value={stats.sources} />
            </div>
          )}

          {activeTab === 'recent' && (
            <div>
              <p className={`${sectionTitle} mb-5`}>
                Dernières entrées · {recentUpdates.length}
              </p>
              {recentUpdates.length === 0 ? (
                <div className="border border-dashed border-[#262732] p-12 text-center">
                  <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] mb-2">
                    — Empty —
                  </p>
                  <p className="text-[#a7a8b3]">Aucune donnée. Lance un scrape.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#1a1b23] border-t border-[#1a1b23]">
                  {recentUpdates.slice(0, 10).map((update, idx) => (
                    <li
                      key={update.id}
                      className="flex items-center justify-between gap-4 py-4 hover:bg-[#0b0b10] transition-colors -mx-3 px-3"
                    >
                      <span className="mono text-[11px] text-[#6a6b78] shrink-0 w-8">
                        {(idx + 1).toString().padStart(3, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] text-[#f5f5f7] truncate">
                          {update.title}
                        </p>
                        <p className="mt-1 mono text-[11px] uppercase tracking-[0.15em] text-[#6a6b78]">
                          <span className="text-[#5b9eff]">{update.source}</span> · {update.slug}
                        </p>
                      </div>
                      <a
                        href={update.article_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mono text-[11px] uppercase tracking-[0.2em] text-[#a7a8b3] hover:text-[#5b9eff] shrink-0"
                      >
                        Source ↗
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function AdminStat({ k, v }: { k: string; v: number }) {
  return (
    <div className="px-5 first:pl-0 py-2">
      <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#6a6b78] mb-1.5">
        {k}
      </p>
      <p className="mono text-2xl text-[#f5f5f7]">
        {v.toString().padStart(3, '0')}
      </p>
    </div>
  );
}

function BigStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="p-8 border-b border-r border-[#1a1b23]">
      <p className="mono text-[11px] uppercase tracking-[0.2em] text-[#6a6b78] mb-4">
        — {label}
      </p>
      <p
        className={`mono text-5xl md:text-6xl tracking-tight ${
          accent ? 'text-[#5b9eff]' : 'text-[#f5f5f7]'
        }`}
      >
        {value.toString().padStart(3, '0')}
      </p>
    </div>
  );
}

function ActionCard({
  num,
  title,
  body,
  button,
  danger,
}: {
  num: string;
  title: string;
  body: string;
  button: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="border-r border-b border-[#1a1b23] p-6 md:p-8 flex flex-col gap-4">
      <p
        className={`mono text-[11px] uppercase tracking-[0.2em] ${
          danger ? 'text-[#ff5a5f]' : 'text-[#5b9eff]'
        }`}
      >
        — {num}
      </p>
      <h3 className="text-xl font-medium tracking-[-0.01em] leading-tight">
        {title}
      </h3>
      <p className="text-[14px] leading-relaxed text-[#a7a8b3] flex-1">
        {body}
      </p>
      <div>{button}</div>
    </div>
  );
}
