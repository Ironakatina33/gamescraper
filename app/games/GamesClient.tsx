'use client';

import Link from 'next/link';
import { useMemo, useState, useRef, useEffect } from 'react';
import { cx, ui } from '../../lib/ui';
import { Pagination } from '../components/Pagination';

type GameRow = {
  id: string;
  title: string;
  slug: string;
  source: string;
  image_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
};

type Props = { games: GameRow[] };

export default function GamesClient({ games }: Props) {
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'alpha'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const itemsPerPage = 18;

  const filterKey = useMemo(() => `${search}-${selectedSource}-${sortBy}`, [search, selectedSource, sortBy]);
  const prevFilterKey = useRef(filterKey);

  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      setCurrentPage(1);
      prevFilterKey.current = filterKey;
    }
  }, [filterKey]);

  const sources = useMemo(() => {
    return Array.from(new Set(games.map((g) => g.source))).sort();
  }, [games]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = games.filter((g) => {
      const matchSearch = !q || g.title.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q);
      const matchSource = selectedSource === 'all' || g.source === selectedSource;
      return matchSearch && matchSource;
    });

    if (sortBy === 'alpha') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [games, search, selectedSource, sortBy]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.getElementById('games-search')?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-6 border-b border-[var(--line)]">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <input
              id="games-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un jeu...  ( / )"
              className={ui.input}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative w-full sm:w-48">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className={`${ui.select} pr-10`}
            >
              <option value="all">Toutes les sources</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]">↓</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy(sortBy === 'date' ? 'alpha' : 'date')}
            className={`${ui.buttonGhost} border border-[var(--line-strong)] text-[12px]`}
          >
            {sortBy === 'date' ? '↓ Récents' : '↓ A-Z'}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={`${ui.buttonGhost} border border-[var(--line-strong)] text-[12px] px-2.5`}
            title={viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
          >
            {viewMode === 'grid' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between py-4">
        <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          {filtered.length} jeu{filtered.length > 1 ? 'x' : ''}
          {search && <span className="text-[var(--brand-hi)]"> · &ldquo;{search}&rdquo;</span>}
          {selectedSource !== 'all' && <span className="text-[var(--brand-hi)]"> · {selectedSource}</span>}
        </p>
        <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          Page {currentPage}/{totalPages || 1}
        </p>
      </div>

      {paginated.length === 0 ? (
        <div className="border border-dashed border-[var(--line-strong)] p-16 text-center">
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-3">
            — Aucun résultat —
          </p>
          <p className="text-[var(--ink-dim)]">
            Essaie un autre terme de recherche ou change les filtres.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--line)]">
          {paginated.map((item, idx) => {
            const absoluteIdx = (currentPage - 1) * itemsPerPage + idx;
            return (
              <Link
                key={item.slug}
                href={`/game/${item.slug}`}
                className="group relative border-b border-r border-[var(--line)] p-5 hover:bg-[var(--bg-elev)] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="mono text-[11px] text-[var(--ink-muted)]">
                    {(absoluteIdx + 1).toString().padStart(3, '0')}
                  </span>
                  <span className="text-[var(--ink-muted)] group-hover:text-[var(--brand-hi)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                    ↗
                  </span>
                </div>
                {item.image_url ? (
                  <div className="relative aspect-[16/10] mb-5 overflow-hidden bg-[var(--bg-elev)] border border-[var(--line)]">
                    <img
                      src={item.image_url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] mb-5 grid place-items-center border border-dashed border-[var(--line-strong)] bg-[var(--bg-elev)]">
                    <span className="mono text-[10px] uppercase text-[var(--ink-muted)]">no image</span>
                  </div>
                )}
                <p className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--brand-hi)] mb-2">
                  {item.source}
                </p>
                <h2 className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--brand-hi)] transition-colors">
                  {item.title}
                </h2>
                {item.summary && (
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-dim)] line-clamp-2">
                    {item.summary}
                  </p>
                )}
                <p className="mt-3 mono text-[11px] text-[var(--ink-muted)]">
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        /* List view */
        <ul className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {paginated.map((item, idx) => {
            const absoluteIdx = (currentPage - 1) * itemsPerPage + idx;
            return (
              <li
                key={item.slug}
                className={cx(
                  'group grid gap-4 py-5 md:grid-cols-[40px_120px_1fr_auto] md:items-center',
                  ui.rowHover,
                  '-mx-3 px-3'
                )}
              >
                <span className="mono text-[11px] text-[var(--ink-muted)]">
                  {(absoluteIdx + 1).toString().padStart(3, '0')}
                </span>
                <Link
                  href={`/game/${item.slug}`}
                  className="relative block h-[68px] w-full md:w-[120px] overflow-hidden border border-[var(--line)] bg-[var(--bg-elev)]"
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="grid h-full place-items-center mono text-[10px] uppercase text-[var(--ink-muted)]">no image</div>
                  )}
                </Link>
                <div className="min-w-0">
                  <p className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--brand-hi)] mb-1.5">{item.source}</p>
                  <Link
                    href={`/game/${item.slug}`}
                    className="text-[16px] font-medium tracking-[-0.01em] text-[var(--ink)] hover:text-[var(--brand-hi)] transition-colors"
                  >
                    {item.title}
                  </Link>
                  {item.summary && (
                    <p className="mt-1 text-[13px] text-[var(--ink-dim)] line-clamp-1">{item.summary}</p>
                  )}
                </div>
                <div className="mono text-[11px] text-[var(--ink-muted)] shrink-0">
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                    : '—'}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > 0 && totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-[var(--line)]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filtered.length}
          />
        </div>
      )}
    </div>
  );
}
