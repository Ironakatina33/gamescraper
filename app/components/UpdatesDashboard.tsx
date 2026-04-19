'use client';

import { useEffect, useMemo, useState } from 'react';

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

type Props = {
  updates: GameUpdate[];
};

export default function UpdatesDashboard({ updates }: Props) {
  const [query, setQuery] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('watchlist-games');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch {
        setWatchlist([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('watchlist-games', JSON.stringify(watchlist));
  }, [watchlist]);

  const sources = useMemo(() => {
    return Array.from(new Set(updates.map((item) => item.source))).sort();
  }, [updates]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return updates.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.title?.toLowerCase().includes(normalizedQuery) ||
        item.slug?.toLowerCase().includes(normalizedQuery) ||
        item.summary?.toLowerCase().includes(normalizedQuery) ||
        item.source?.toLowerCase().includes(normalizedQuery);

      const matchesSource =
        sourceFilter === 'all' || item.source === sourceFilter;

      return matchesQuery && matchesSource;
    });
  }, [updates, normalizedQuery, sourceFilter]);

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];

    const uniqueTitles = Array.from(
      new Map(
        updates.map((item) => [
          item.slug,
          {
            slug: item.slug,
            title: item.title,
          },
        ])
      ).values()
    );

    return uniqueTitles
      .filter((item) => item.title.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [updates, normalizedQuery]);

  const latestBySlug = useMemo(() => {
    const map = new Map<string, GameUpdate>();

    for (const item of updates) {
      const existing = map.get(item.slug);

      if (!existing) {
        map.set(item.slug, item);
        continue;
      }

      const currentDate = item.published_at ? new Date(item.published_at).getTime() : 0;
      const existingDate = existing.published_at ? new Date(existing.published_at).getTime() : 0;

      if (currentDate > existingDate) {
        map.set(item.slug, item);
      }
    }

    return map;
  }, [updates]);

  const watchedGames = watchlist
    .map((slug) => latestBySlug.get(slug))
    .filter(Boolean) as GameUpdate[];

  function toggleWatchlist(slug: string) {
    setWatchlist((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  }

  return (
    <main className="min-h-screen bg-[#0f141a] text-[#d6dde5]">
      <header className="border-b border-[#1d2731] bg-[#121a24]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#66c0f4]" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-[#66c0f4]">
                  tracker
                </div>
                <div className="text-sm font-bold text-white">GameScraper</div>
              </div>
            </a>

            <nav className="hidden items-center gap-4 md:flex">
              <a href="/" className="text-sm text-[#d6dde5] hover:text-white">
                Accueil
              </a>
              <a href="/" className="text-sm text-[#8b98a5] hover:text-white">
                Jeux
              </a>
              <a href="/" className="text-sm text-[#8b98a5] hover:text-white">
                Suivis
              </a>
            </nav>
          </div>

          <div className="text-xs text-[#8b98a5]">
            {updates.length} update{updates.length > 1 ? 's' : ''} • {watchlist.length} suivi{watchlist.length > 1 ? 's' : ''}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-0 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="border-r border-[#1d2731] bg-[#111821]">
          <div className="p-4">
            <div className="mb-6">
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-[#66c0f4]">
                Navigation
              </p>

              <div className="space-y-1">
                <a
                  href="/"
                  className="block border border-[#263241] bg-[#182230] px-3 py-2 text-sm text-white"
                >
                  Toutes les mises à jour
                </a>

                <a
                  href="/"
                  className="block border border-transparent px-3 py-2 text-sm text-[#8b98a5] hover:border-[#263241] hover:bg-[#182230] hover:text-white"
                >
                  Derniers jeux
                </a>

                <a
                  href="/"
                  className="block border border-transparent px-3 py-2 text-sm text-[#8b98a5] hover:border-[#263241] hover:bg-[#182230] hover:text-white"
                >
                  Sources
                </a>
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-[#66c0f4]">
                Filtres
              </p>

              <label className="mb-2 block text-xs text-[#8b98a5]">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full border border-[#263241] bg-[#182230] px-3 py-2 text-sm text-white outline-none"
              >
                <option value="all">Toutes</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-[#66c0f4]">
                Infos
              </p>

              <div className="space-y-2 text-sm text-[#8b98a5]">
                <div className="border border-[#263241] bg-[#182230] px-3 py-2">
                  {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
                </div>
                <div className="border border-[#263241] bg-[#182230] px-3 py-2">
                  {watchlist.length} jeu{watchlist.length > 1 ? 'x' : ''} suivi{watchlist.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 bg-[#0f141a]">
          <div className="border-b border-[#1d2731] bg-[#121a24] p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Toutes les mises à jour</h1>
                <p className="mt-1 text-sm text-[#8b98a5]">
                  Base compacte des mises à jour enregistrées
                </p>
              </div>

              <div className="relative w-full max-w-xl">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Rechercher un jeu, un slug, une source..."
                  className="w-full border border-[#314355] bg-[#182230] px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#73808c]"
                />

                {showSuggestions && suggestions.length > 0 && query.trim() && (
                  <div className="absolute z-30 mt-1 w-full border border-[#263241] bg-[#121a24] shadow-2xl">
                    {suggestions.map((item) => (
                      <button
                        key={item.slug}
                        onClick={() => {
                          setQuery(item.title);
                          setShowSuggestions(false);
                        }}
                        className="flex w-full items-center justify-between border-b border-[#1d2731] px-4 py-2.5 text-left hover:bg-[#182230]"
                      >
                        <span className="text-sm text-white">{item.title}</span>
                        <span className="text-xs text-[#8b98a5]">{item.slug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[2.2fr_1fr_160px_170px_140px] border-b border-[#1d2731] bg-[#111821] px-4 py-3 text-[11px] uppercase tracking-[0.15em] text-[#6f7c88]">
                <div>Jeu / Update</div>
                <div>Source</div>
                <div>Date</div>
                <div>Navigation</div>
                <div>Suivi</div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-8 text-sm text-[#8b98a5]">
                  Aucun résultat pour cette recherche.
                </div>
              ) : (
                filtered.map((item) => {
                  const isWatched = watchlist.includes(item.slug);

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[2.2fr_1fr_160px_170px_140px] items-start border-b border-[#18212b] px-4 py-4 hover:bg-[#121a24]"
                    >
                      <div className="pr-4">
                        <a
                          href={`/game/${item.slug}`}
                          className="text-base font-semibold text-white hover:text-[#66c0f4]"
                        >
                          {item.title}
                        </a>

                        <p className="mt-1 text-xs text-[#6f7c88]">{item.slug}</p>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#aeb8c2]">
                          {item.summary || 'Aucun résumé disponible.'}
                        </p>
                      </div>

                      <div className="pr-4 text-sm text-[#c7d5e0]">
                        {item.source}
                      </div>

                      <div className="pr-4 text-sm text-[#8b98a5]">
                        {item.published_at
                          ? new Date(item.published_at).toLocaleString()
                          : 'Date inconnue'}
                      </div>

                      <div className="flex flex-col gap-2 pr-4">
                        <a
                          href={`/game/${item.slug}`}
                          className="border border-[#2c3b4b] bg-[#182230] px-3 py-2 text-center text-sm text-white hover:bg-[#223041]"
                        >
                          Fiche
                        </a>

                        <a
                          href={item.article_url}
                          target="_blank"
                          rel="noreferrer"
                          className="border border-[#2c3b4b] bg-[#10161d] px-3 py-2 text-center text-sm text-[#8fbfe0] hover:bg-[#182230]"
                        >
                          Source
                        </a>
                      </div>

                      <div>
                        <button
                          onClick={() => toggleWatchlist(item.slug)}
                          className={`w-full px-3 py-2 text-sm font-medium ${
                            isWatched
                              ? 'bg-[#1f4e2f] text-[#baffc4] hover:bg-[#28653d]'
                              : 'bg-[#2a475e] text-white hover:bg-[#3b6687]'
                          }`}
                        >
                          {isWatched ? 'Suivi' : 'Suivre'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <aside className="border-l border-[#1d2731] bg-[#111821]">
          <div className="p-4">
            <h2 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#66c0f4]">
              Jeux suivis
            </h2>

            {watchedGames.length === 0 ? (
              <div className="border border-[#263241] bg-[#182230] p-4 text-sm leading-7 text-[#8b98a5]">
                Aucun jeu suivi pour l’instant.
              </div>
            ) : (
              <div className="space-y-3">
                {watchedGames.map((item) => (
                  <div key={item.slug} className="border border-[#263241] bg-[#182230] p-4">
                    <a
                      href={`/game/${item.slug}`}
                      className="text-sm font-semibold text-white hover:text-[#66c0f4]"
                    >
                      {item.title}
                    </a>

                    <p className="mt-2 text-xs leading-6 text-[#8b98a5]">
                      Dernière update :
                    </p>

                    <p className="mt-1 text-xs leading-6 text-[#c7d5e0]">
                      {item.published_at
                        ? new Date(item.published_at).toLocaleString()
                        : 'Date inconnue'}
                    </p>

                    <button
                      onClick={() => toggleWatchlist(item.slug)}
                      className="mt-3 w-full bg-[#2a475e] px-3 py-2 text-sm text-white hover:bg-[#3b6687]"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}