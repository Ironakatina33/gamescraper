'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { cx, ui } from '../../lib/ui';
import AppShell from './AppShell';

type GameUpdate = {
  id: string;
  title: string;
  slug: string;
  source: string;
  article_url: string;
  summary?: string | null;
  published_at?: string | null;
};

type UpdatesDashboardProps = {
  updates: GameUpdate[];
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

function formatDate(value?: string | null) {
  if (!value) return 'Date inconnue';
  return new Date(value).toLocaleString();
}

export default function UpdatesDashboard({ updates }: UpdatesDashboardProps) {
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setWatchlist(getSavedWatchlist());
  }, []);

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  const sources = useMemo(() => {
    return Array.from(new Set(updates.map((item) => item.source))).sort();
  }, [updates]);

  const filteredUpdates = useMemo(() => {
    const value = search.trim().toLowerCase();

    return updates.filter((item) => {
      const matchesSearch =
        !value ||
        item.title.toLowerCase().includes(value) ||
        item.slug.toLowerCase().includes(value) ||
        (item.summary ?? '').toLowerCase().includes(value) ||
        item.source.toLowerCase().includes(value);

      const matchesSource =
        selectedSource === 'all' || item.source === selectedSource;

      return matchesSearch && matchesSource;
    });
  }, [updates, search, selectedSource]);

  const suggestions = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return [];

    const uniqueGames = Array.from(
      new Map(updates.map((item) => [item.slug, item])).values()
    );

    return uniqueGames
      .filter((item) => item.title.toLowerCase().includes(value))
      .slice(0, 5);
  }, [updates, search]);

  function isInWatchlist(slug: string) {
    return watchlist.includes(slug);
  }

  function toggleWatchlist(slug: string) {
    if (watchlist.includes(slug)) {
      setWatchlist(watchlist.filter((item) => item !== slug));
    } else {
      setWatchlist([...watchlist, slug]);
    }
  }

  return (
    <AppShell
      title="Toutes les mises à jour"
      subtitle="Cherche un jeu, ouvre sa page, ou ajoute-le à ta watchlist"
    >
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
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
              <p className="text-xs text-[#8b98a5]">Résultats</p>
              <p className="mt-1 text-xl font-bold text-white">
                {filteredUpdates.length}
              </p>
            </div>

            <div className={`${ui.card} p-3`}>
              <p className="text-xs text-[#8b98a5]">Jeux suivis</p>
              <p className="mt-1 text-xl font-bold text-white">
                {watchlist.length}
              </p>
            </div>
          </div>
        </aside>

        <section className={ui.cardSoft}>
          <div className="grid grid-cols-[2.2fr_1fr_170px_240px] border-b border-[#1d2731] bg-[#121a24] px-4 py-3 text-xs uppercase tracking-[0.12em] text-[#6f7c88]">
            <div>Jeu</div>
            <div>Source</div>
            <div>Date</div>
            <div>Actions</div>
          </div>

          {filteredUpdates.length === 0 ? (
            <div className="p-6 text-sm text-[#8b98a5]">
              Aucun résultat trouvé.
            </div>
          ) : (
            filteredUpdates.map((item) => {
              const followed = isInWatchlist(item.slug);

              return (
                <div
                  key={item.id}
                  className={cx(
                    'grid grid-cols-[2.2fr_1fr_170px_240px] items-start border-b border-[#1d2731] px-4 py-4',
                    ui.rowHover
                  )}
                >
                  <div className="pr-4">
                    <Link
                      href={`/game/${item.slug}`}
                      className="inline-block text-base font-semibold text-white underline-offset-4 hover:text-[#66c0f4] hover:underline"
                    >
                      Voir la page du jeu : {item.title}
                    </Link>

                    <p className="mt-1 text-xs text-[#6f7c88]">{item.slug}</p>

                    <p className="mt-2 text-sm leading-6 text-[#aeb8c2]">
                      {item.summary || 'Aucun résumé disponible.'}
                    </p>
                  </div>

                  <div className="pr-4 text-sm text-[#c7d5e0]">{item.source}</div>

                  <div className="pr-4 text-sm text-[#8b98a5]">
                    {formatDate(item.published_at)}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/game/${item.slug}`} className={ui.buttonPrimary}>
                      Voir la page du jeu
                    </Link>

                    <a
                      href={item.article_url}
                      target="_blank"
                      rel="noreferrer"
                      className={ui.buttonSecondary}
                    >
                      Ouvrir la source externe
                    </a>

                    <button
                      onClick={() => toggleWatchlist(item.slug)}
                      className={
                        followed ? ui.buttonWatchRemove : ui.buttonWatchAdd
                      }
                    >
                      {followed
                        ? 'Retirer de ma watchlist'
                        : 'Ajouter à ma watchlist'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </AppShell>
  );
}