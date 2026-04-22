'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { cx, ui } from '../../lib/ui';
import AppShell from './AppShell';
import { useToast } from './ToastContext';
import { Pagination } from './Pagination';
import { useAutoRefresh, AutoRefreshToggle } from './AutoRefresh';

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

type UpdatesDashboardProps = {
  updates: GameUpdate[];
  onRefresh?: () => void;
};

function getSavedWatchlist(): string[] {
  try {
    const raw = localStorage.getItem('watchlist-games');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(slugs: string[]) {
  localStorage.setItem('watchlist-games', JSON.stringify(slugs));
}

function getSeenBySlug(): Record<string, string> {
  try {
    const raw = localStorage.getItem('watchlist-seen-by-slug');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSeenBySlug(values: Record<string, string>) {
  localStorage.setItem('watchlist-seen-by-slug', JSON.stringify(values));
}

function formatDate(value?: string | null) {
  if (!value) return 'Date inconnue';
  return new Date(value).toLocaleString('fr-FR');
}

export default function UpdatesDashboard({ updates, onRefresh }: UpdatesDashboardProps) {
  const { showSuccess, showInfo } = useToast();
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [watchlist, setWatchlist] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : getSavedWatchlist()
  );
  const [seenBySlug, setSeenBySlug] = useState<Record<string, string>>(() =>
    typeof window === 'undefined' ? {} : getSeenBySlug()
  );
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ref to track filter changes for page reset
  const filterKey = useMemo(() => `${search}-${selectedSource}-${watchlistOnly}`, [search, selectedSource, watchlistOnly]);
  const prevFilterKey = useRef(filterKey);

  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      setCurrentPage(1);
      prevFilterKey.current = filterKey;
    }
  }, [filterKey]);

  // Auto-refresh hook
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Fallback: reload page if no onRefresh provided
      window.location.reload();
    }
  }, [onRefresh]);

  const { enabled, toggleAutoRefresh, lastRefresh, nextRefresh } = useAutoRefresh({
    onRefresh: handleRefresh,
    intervalMinutes: 5,
    enabled: true,
  });

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  const sources = useMemo(() => {
    return Array.from(new Set(updates.map((item) => item.source))).sort();
  }, [updates]);

  const withStatus = useMemo(() => {
    return updates.map((item) => {
      const isFollowed = watchlist.includes(item.slug);
      const seenAt = seenBySlug[item.slug];
      const isNew = Boolean(
        isFollowed &&
          item.published_at &&
          (!seenAt ||
            new Date(item.published_at).getTime() > new Date(seenAt).getTime())
      );
      return { ...item, isFollowed, isNew };
    });
  }, [updates, watchlist, seenBySlug]);

  const filteredUpdates = useMemo(() => {
    const value = search.trim().toLowerCase();

    return withStatus.filter((item) => {
      const matchesSearch =
        !value ||
        item.title.toLowerCase().includes(value) ||
        item.slug.toLowerCase().includes(value) ||
        (item.summary ?? '').toLowerCase().includes(value) ||
        item.source.toLowerCase().includes(value);

      const matchesSource =
        selectedSource === 'all' || item.source === selectedSource;

      const matchesWatchlist = !watchlistOnly || item.isFollowed;

      return matchesSearch && matchesSource && matchesWatchlist;
    });
  }, [withStatus, search, selectedSource, watchlistOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredUpdates.length / itemsPerPage);
  const paginatedUpdates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUpdates.slice(start, start + itemsPerPage);
  }, [filteredUpdates, currentPage]);

  const suggestions = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return [];

    const uniqueGames = Array.from(
      new Map(withStatus.map((item) => [item.slug, item])).values()
    );

    return uniqueGames
      .filter((item) => item.title.toLowerCase().includes(value))
      .slice(0, 5);
  }, [withStatus, search]);

  const newCount = useMemo(
    () => withStatus.filter((item) => item.isNew).length,
    [withStatus]
  );

  function isInWatchlist(slug: string) {
    return watchlist.includes(slug);
  }

  function toggleWatchlist(slug: string, title: string) {
    if (watchlist.includes(slug)) {
      setWatchlist(watchlist.filter((item) => item !== slug));
      showInfo(`${title} retiré de la watchlist`);
    } else {
      setWatchlist([...watchlist, slug]);
      showSuccess(`${title} ajouté à la watchlist`);
    }
  }

  function markAsSeen(slug: string, publishedAt?: string | null) {
    const next = { ...seenBySlug, [slug]: publishedAt ?? new Date().toISOString() };
    setSeenBySlug(next);
    saveSeenBySlug(next);
    showInfo('Marqué comme lu');
  }

  function markAllAsSeen() {
    const next = { ...seenBySlug };
    let count = 0;
    for (const item of withStatus) {
      if (item.isFollowed && item.isNew) {
        next[item.slug] = item.published_at ?? new Date().toISOString();
        count++;
      }
    }
    setSeenBySlug(next);
    saveSeenBySlug(next);
    showSuccess(`${count} mise${count > 1 ? 's' : ''} à jour marquée${count > 1 ? 's' : ''} comme lue${count > 1 ? 's' : ''}`);
  }

  return (
    <AppShell
      title="Toutes les mises à jour"
      subtitle="Cherche un jeu, ouvre sa page, ou ajoute-le à ta watchlist"
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className={`${ui.card} p-4`}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Updates</p>
          <p className="mt-2 text-2xl font-black text-white">{updates.length}</p>
        </div>
        <div className={`${ui.card} p-4`}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Watchlist</p>
          <p className="mt-2 text-2xl font-black text-white">{watchlist.length}</p>
        </div>
        <div className={`${ui.card} p-4`}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Non lues</p>
          <p className="mt-2 text-2xl font-black text-[#66c0f4]">{newCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`${ui.cardSoft} p-4`}>
          <h2 className={ui.sectionTitle}>Filtres</h2>

          <div className="space-y-4">
            <div>
              <label className={ui.label}>Recherche</label>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Ex: Game A"
                  className={ui.input}
                />

                {showSuggestions && suggestions.length > 0 && search.trim() && (
                  <div className="absolute z-20 mt-1 w-full border border-[#263241] bg-[#121a24]">
                    {suggestions.map((item) => (
                      <button
                        key={item.slug}
                        onClick={() => {
                          setSearch(item.title);
                          setShowSuggestions(false);
                        }}
                        className="block w-full border-b border-[#1d2731] px-3 py-2 text-left text-sm text-white hover:bg-[#182230]"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={ui.label}>Actualisation</label>
              <AutoRefreshToggle
                enabled={enabled}
                onToggle={toggleAutoRefresh}
                lastRefresh={lastRefresh}
                nextRefresh={nextRefresh}
                intervalMinutes={5}
              />
            </div>

            <div>
              <label className={ui.label}>Source</label>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className={ui.select}
              >
                <option value="all">Toutes les sources</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${ui.card} p-3`}>
              <p className="text-xs text-[#8b98a5]">Résultats filtrés</p>
              <p className="mt-1 text-xl font-bold text-white">
                {filteredUpdates.length}
              </p>
            </div>

            <button
              onClick={() => setWatchlistOnly((v) => !v)}
              className={watchlistOnly ? ui.buttonWatchRemove : ui.buttonSecondary}
            >
              {watchlistOnly ? 'Afficher toutes les updates' : 'Voir seulement ma watchlist'}
            </button>

            <button onClick={markAllAsSeen} className={ui.buttonSecondary}>
              Marquer ma watchlist comme lue
            </button>
          </div>
        </aside>

        <section className="grid gap-4">
          {paginatedUpdates.length === 0 ? (
            <div className={`${ui.cardSoft} p-6 text-sm text-[#8b98a5]`}>
              Aucun résultat trouvé.
            </div>
          ) : (
            paginatedUpdates.map((item) => {
              const followed = isInWatchlist(item.slug);

              return (
                <div
                  key={item.id}
                  className={cx(ui.card, 'p-5')}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 lg:max-w-[70%]">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="mb-4 h-40 w-full rounded-xl border border-[#2a3b4f] object-cover"
                        />
                      ) : null}
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#8b98a5]">
                        <span>{item.source}</span>
                        {item.isNew && (
                          <span className="rounded bg-[#66c0f4] px-2 py-1 text-[10px] font-bold text-[#0b141b]">
                            NEW
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/game/${item.slug}`}
                        className="inline-block text-xl font-black text-white hover:text-[#66c0f4]"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs text-[#6f7c88]">{item.slug}</p>
                      <p className="mt-3 text-sm leading-6 text-[#aeb8c2]">
                        {item.summary || 'Aucun résumé disponible.'}
                      </p>
                      <p className="mt-3 text-xs text-[#8b98a5]">
                        {formatDate(item.published_at)}
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 lg:w-[230px]">
                      <Link href={`/game/${item.slug}`} className={ui.buttonPrimary}>
                        Voir la fiche
                      </Link>
                      <a
                        href={item.article_url}
                        target="_blank"
                        rel="noreferrer"
                        className={ui.buttonSecondary}
                      >
                        Ouvrir la source
                      </a>
                      <button
                        onClick={() => toggleWatchlist(item.slug, item.title)}
                        className={followed ? ui.buttonWatchRemove : ui.buttonWatchAdd}
                      >
                        {followed ? 'Retirer de ma watchlist' : 'Ajouter à ma watchlist'}
                      </button>
                      {followed && (
                        <button
                          onClick={() => markAsSeen(item.slug, item.published_at)}
                          className={ui.buttonSecondary}
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {filteredUpdates.length > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredUpdates.length}
              />
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}