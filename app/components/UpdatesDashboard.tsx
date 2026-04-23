'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { cx, ui } from '../../lib/ui';
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

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.getElementById('updates-search')?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

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
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* SIDEBAR FILTERS */}
      <aside className="lg:sticky lg:top-[78px] lg:self-start space-y-8">
        <div>
          <p className={ui.sectionTitle}>Recherche</p>
          <div className="relative mt-3">
            <input
              id="updates-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Titre, slug, source...  ( / )"
              className={ui.input}
            />
            {showSuggestions && suggestions.length > 0 && search.trim() && (
              <div className="absolute z-20 mt-1 w-full border border-[var(--line-strong)] bg-[var(--bg-card)] shadow-xl">
                {suggestions.map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => {
                      setSearch(item.title);
                      setShowSuggestions(false);
                    }}
                    className="block w-full border-b border-[var(--line)] last:border-b-0 px-3 py-2.5 text-left text-sm text-[var(--ink)] hover:bg-[var(--bg-elev)]"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className={ui.sectionTitle}>Source</p>
          <div className="mt-3 relative">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className={`${ui.select} pr-10`}
            >
              <option value="all">Toutes</option>
              {sources.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]">↓</span>
          </div>
        </div>

        <div>
          <p className={ui.sectionTitle}>Actualisation</p>
          <div className="mt-3">
            <AutoRefreshToggle
              enabled={enabled}
              onToggle={toggleAutoRefresh}
              lastRefresh={lastRefresh}
              nextRefresh={nextRefresh}
              intervalMinutes={5}
            />
          </div>
        </div>

        <div>
          <p className={ui.sectionTitle}>Actions</p>
          <div className="mt-3 space-y-2">
            <button
              onClick={() => setWatchlistOnly((v) => !v)}
              className={`w-full ${watchlistOnly ? ui.buttonWatchRemove : ui.buttonSecondary}`}
            >
              {watchlistOnly ? 'Voir tout' : 'Watchlist seulement'}
            </button>
            <button onClick={markAllAsSeen} className={`w-full ${ui.buttonGhost} border border-[var(--line-strong)]`}>
              Tout marquer comme lu
            </button>
          </div>
        </div>

        <div className="border-t border-[var(--line)] pt-6 space-y-3">
          <RowStat label="Résultats" value={filteredUpdates.length} />
          <RowStat label="Watchlist" value={watchlist.length} />
          <RowStat label="Non lues" value={newCount} accent />
        </div>
      </aside>

      {/* RESULTS */}
      <section>
        {/* Result header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            {filteredUpdates.length} résultats
            {selectedSource !== 'all' && <span className="text-[var(--brand-hi)]"> · {selectedSource}</span>}
            {watchlistOnly && <span className="text-[var(--brand-hi)]"> · watchlist</span>}
          </p>
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Page {currentPage}/{totalPages || 1}
          </p>
        </div>

        {paginatedUpdates.length === 0 ? (
          <div className="border border-dashed border-[var(--line-strong)] p-16 text-center mt-6">
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-3">
              — Empty —
            </p>
            <p className="text-[var(--ink-dim)]">
              Aucun résultat. Essaie d&apos;ajuster tes filtres.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {paginatedUpdates.map((item, idx) => {
              const followed = isInWatchlist(item.slug);
              const absoluteIdx = (currentPage - 1) * itemsPerPage + idx + 1;

              return (
                <li
                  key={item.id}
                  className={cx(
                    'group grid gap-5 py-6 md:grid-cols-[40px_160px_1fr_auto] md:items-start',
                    ui.rowHover,
                    '-mx-3 px-3'
                  )}
                >
                  <span className="mono text-[11px] text-[var(--ink-muted)] pt-1">
                    {absoluteIdx.toString().padStart(3, '0')}
                  </span>

                  {/* Thumb */}
                  <Link
                    href={`/game/${item.slug}`}
                    className="relative block h-[90px] w-full md:w-[160px] overflow-hidden border border-[var(--line)] bg-[var(--bg-elev)]"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full place-items-center mono text-[10px] uppercase text-[var(--ink-muted)]">
                        no image
                      </div>
                    )}
                    {item.isNew && (
                      <span className="absolute top-1.5 left-1.5 mono text-[9px] uppercase tracking-[0.2em] bg-[var(--brand)] text-white px-1.5 py-0.5">
                        New
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted)] mb-2">
                      <span className="text-[var(--brand-hi)]">{item.source}</span>
                      <span>·</span>
                      <span>{formatDate(item.published_at)}</span>
                      {followed && (
                        <>
                          <span>·</span>
                          <span className="text-[var(--good)]">★ suivi</span>
                        </>
                      )}
                    </div>
                    <Link
                      href={`/game/${item.slug}`}
                      className="text-[17px] md:text-[18px] font-medium tracking-[-0.01em] leading-snug text-[var(--ink)] hover:text-[var(--brand-hi)] transition-colors"
                    >
                      {item.title}
                    </Link>
                    {item.summary ? (
                      <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-dim)] line-clamp-2 max-w-2xl">
                        {item.summary}
                      </p>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 md:w-[160px]">
                    <button
                      onClick={() => toggleWatchlist(item.slug, item.title)}
                      className={`flex-1 md:flex-none text-[12px] py-2 px-3 ${
                        followed ? ui.buttonWatchRemove : ui.buttonWatchAdd
                      }`}
                    >
                      {followed ? '− Retirer' : '+ Watchlist'}
                    </button>
                    <a
                      href={item.article_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-1 text-[12px] py-2 px-3 text-[var(--ink-dim)] hover:text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--ink-dim)] transition-colors"
                    >
                      Source ↗
                    </a>
                    {followed && item.isNew && (
                      <button
                        onClick={() => markAsSeen(item.slug, item.published_at)}
                        className="text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-2"
                      >
                        marquer lu
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {filteredUpdates.length > 0 && totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-[var(--line)]">
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
  );
}

function RowStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
        {label}
      </span>
      <span
        className={`mono text-lg ${accent ? 'text-[var(--brand-hi)]' : 'text-[var(--ink)]'}`}
      >
        {value.toString().padStart(2, '0')}
      </span>
    </div>
  );
}