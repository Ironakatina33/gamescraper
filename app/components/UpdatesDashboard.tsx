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

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return updates;

    return updates.filter((item) => {
      const title = item.title?.toLowerCase() ?? '';
      const summary = item.summary?.toLowerCase() ?? '';
      const source = item.source?.toLowerCase() ?? '';
      const slug = item.slug?.toLowerCase() ?? '';

      return (
        title.includes(normalizedQuery) ||
        summary.includes(normalizedQuery) ||
        source.includes(normalizedQuery) ||
        slug.includes(normalizedQuery)
      );
    });
  }, [updates, normalizedQuery]);

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

  function toggleWatchlist(slug: string) {
    setWatchlist((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  }

  const watchedUpdates = watchlist
    .map((slug) => latestBySlug.get(slug))
    .filter(Boolean) as GameUpdate[];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#18181b_0%,_#09090b_45%,_#000_100%)] text-white">
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Game Update Tracker
              </div>

              <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight">
                Dernières mises à jour
                <span className="block bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                  de jeux
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400 text-base md:text-lg leading-8">
                Recherche instantanée, suggestions dynamiques, et watchlist locale
                pour garder les jeux qui t’intéressent en mémoire.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total</p>
                <p className="mt-2 text-2xl font-bold">{updates.length}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Filtrés</p>
                <p className="mt-2 text-2xl font-bold">{filtered.length}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 col-span-2 sm:col-span-1">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Suivis</p>
                <p className="mt-2 text-2xl font-bold">{watchlist.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/30">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Recherche un jeu, une source, un résumé..."
                  className="w-full rounded-2xl bg-black/20 px-5 py-4 text-white placeholder:text-zinc-500 outline-none"
                />
              </div>

              {showSuggestions && suggestions.length > 0 && query.trim() && (
                <div className="absolute z-20 mt-3 w-full rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                  {suggestions.map((item) => (
                    <button
                      key={item.slug}
                      onClick={() => {
                        setQuery(item.title);
                        setShowSuggestions(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-zinc-500">{item.slug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold mb-3">Watchlist locale</h2>

              {watchedUpdates.length === 0 ? (
                <p className="text-sm text-zinc-400 leading-7">
                  Tu n’as encore aucun jeu suivi. Clique sur “Suivre” sur une carte
                  pour l’ajouter localement dans ton navigateur.
                </p>
              ) : (
                <div className="space-y-3">
                  {watchedUpdates.map((item) => (
                    <div
                      key={item.slug}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-zinc-400 mt-1">
                            Dernière mise à jour :
                            {' '}
                            {item.published_at
                              ? new Date(item.published_at).toLocaleString()
                              : 'Date inconnue'}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleWatchlist(item.slug)}
                          className="rounded-xl border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 transition"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-semibold">Aucun résultat</h2>
            <p className="mt-3 text-zinc-400">
              Essaie un autre mot-clé ou ajoute d’autres mises à jour.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filtered.map((item) => {
              const isWatched = watchlist.includes(item.slug);

              return (
                <article
                  key={item.id}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/[0.07] hover:-translate-y-0.5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-4xl">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                          {item.source}
                        </span>

                        {isWatched ? (
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-emerald-300">
                            Suivi
                          </span>
                        ) : null}
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                        {item.title}
                      </h2>

                      <p className="mt-4 text-zinc-300 leading-8">
                        {item.summary || 'Aucun résumé disponible.'}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <a
                          href={item.article_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 transition"
                        >
                          Voir la source
                        </a>

                        <button
                          onClick={() => toggleWatchlist(item.slug)}
                          className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition"
                        >
                          {isWatched ? 'Retirer du suivi' : 'Suivre ce jeu'}
                        </button>

                        <span className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-zinc-400">
                          slug : {item.slug}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-zinc-500 whitespace-nowrap">
                      {item.published_at
                        ? new Date(item.published_at).toLocaleString()
                        : 'Date inconnue'}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}