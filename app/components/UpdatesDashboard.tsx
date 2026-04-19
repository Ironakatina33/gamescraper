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

        const unique = Array.from(
            new Map(
                updates.map((item) => [
                    item.slug,
                    { slug: item.slug, title: item.title },
                ])
            ).values()
        );

        return unique
            .filter((item) => item.title.toLowerCase().includes(normalizedQuery))
            .slice(0, 6);
    }, [updates, normalizedQuery]);

    const latestBySlug = useMemo(() => {
        const map = new Map<string, GameUpdate>();

        for (const item of updates) {
            const current = map.get(item.slug);

            if (!current) {
                map.set(item.slug, item);
                continue;
            }

            const currentTime = item.published_at ? new Date(item.published_at).getTime() : 0;
            const savedTime = current.published_at ? new Date(current.published_at).getTime() : 0;

            if (currentTime > savedTime) {
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
        <main className="min-h-screen bg-[#101822] text-white">
            <div className="min-h-screen bg-[linear-gradient(180deg,#1b2838_0%,#101822_28%,#0b1118_100%)]">
                <header className="border-b border-white/5 bg-[#171d25]/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#66c0f4] text-sm font-black text-[#0b141b]">
                                    GU
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.35em] text-[#66c0f4]">
                                        launcher
                                    </p>
                                    <h1 className="text-lg font-bold text-white">GameScraper</h1>
                                </div>
                            </div>

                            <nav className="hidden items-center gap-6 md:flex">
                                <a href="/" className="text-sm font-medium text-[#c7d5e0] hover:text-white">
                                    Store
                                </a>
                                <a href="/" className="text-sm font-medium text-[#c7d5e0] hover:text-white">
                                    Updates
                                </a>
                                <a href="/" className="text-sm font-medium text-[#c7d5e0] hover:text-white">
                                    Library
                                </a>
                                <a href="/" className="text-sm font-medium text-[#c7d5e0] hover:text-white">
                                    Watchlist
                                </a>
                            </nav>
                        </div>

                        <div className="hidden rounded-full border border-white/10 bg-[#0f151c] px-4 py-2 text-xs text-[#8f98a0] md:block">
                            {watchlist.length} jeu{watchlist.length > 1 ? 'x' : ''} suivi{watchlist.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </header>

                <section className="border-b border-white/5 bg-[radial-gradient(circle_at_top_left,#26475f_0%,rgba(38,71,95,0.35)_25%,transparent_55%)]">
                    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr]">
                        <div>
                            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#66c0f4]">
                                Latest gaming news
                            </p>

                            <h2 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
                                Suis les dernières
                                <span className="block text-[#66c0f4]">mises à jour de jeux</span>
                            </h2>

                            <p className="mt-4 max-w-2xl text-base leading-8 text-[#c7d5e0]">
                                Une interface inspirée d’un launcher gaming pour suivre les updates,
                                rechercher rapidement un titre, et garder tes jeux préférés dans une
                                watchlist locale.
                            </p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-md border border-white/10 bg-[#16202d] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[#8f98a0]">Updates</p>
                                    <p className="mt-2 text-3xl font-bold text-white">{updates.length}</p>
                                </div>

                                <div className="rounded-md border border-white/10 bg-[#16202d] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[#8f98a0]">Résultats</p>
                                    <p className="mt-2 text-3xl font-bold text-white">{filtered.length}</p>
                                </div>

                                <div className="rounded-md border border-white/10 bg-[#16202d] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[#8f98a0]">Suivis</p>
                                    <p className="mt-2 text-3xl font-bold text-white">{watchlist.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border border-white/10 bg-[#16202d] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                            <div className="relative">
                                <div className="flex items-center gap-3 rounded-md border border-[#316282] bg-[#0f151c] px-4 py-3">
                                    <span className="text-[#66c0f4]">⌕</span>
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="Rechercher un jeu..."
                                        className="w-full bg-transparent text-white placeholder:text-[#7c8791] outline-none"
                                    />
                                </div>

                                {showSuggestions && suggestions.length > 0 && query.trim() && (
                                    <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-md border border-white/10 bg-[#10161d] shadow-2xl">
                                        {suggestions.map((item) => (
                                            <button
                                                key={item.slug}
                                                onClick={() => {
                                                    setQuery(item.title);
                                                    setShowSuggestions(false);
                                                }}
                                                className="flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left hover:bg-[#1b2838]"
                                            >
                                                <span className="font-medium text-white">{item.title}</span>
                                                <span className="text-xs text-[#8f98a0]">{item.slug}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 rounded-md border border-white/10 bg-[#0f151c] p-4">
                                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#8f98a0]">
                                    Quick access
                                </p>
                                <p className="text-sm leading-7 text-[#c7d5e0]">
                                    Tape un titre pour filtrer immédiatement les résultats et obtenir des
                                    suggestions de jeux pendant la saisie.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[0.34fr_0.66fr]">
                    <aside className="space-y-5">
                        <div className="rounded-md border border-white/10 bg-[#16202d] shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                            <div className="border-b border-white/5 px-5 py-4">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#66c0f4]">
                                    Watchlist
                                </h3>
                            </div>

                            <div className="p-4">
                                {watchedGames.length === 0 ? (
                                    <p className="text-sm leading-7 text-[#8f98a0]">
                                        Aucun jeu suivi pour l’instant. Clique sur “Suivre” dans les cartes
                                        pour les garder localement en mémoire.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {watchedGames.map((item) => (
                                            <div
                                                key={item.slug}
                                                className="rounded-md border border-white/10 bg-[#0f151c] p-4"
                                            >
                                                <p className="font-semibold text-white">{item.title}</p>
                                                <p className="mt-2 text-xs leading-6 text-[#8f98a0]">
                                                    Dernière activité :
                                                    {' '}
                                                    {item.published_at
                                                        ? new Date(item.published_at).toLocaleString()
                                                        : 'Date inconnue'}
                                                </p>

                                                <button
                                                    onClick={() => toggleWatchlist(item.slug)}
                                                    className="mt-3 rounded bg-[#2a475e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3b6687]"
                                                >
                                                    Retirer
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-md border border-white/10 bg-[#16202d] shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                            <div className="border-b border-white/5 px-5 py-4">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#66c0f4]">
                                    Navigation
                                </h3>
                            </div>

                            <div className="p-4 text-sm text-[#c7d5e0]">
                                <ul className="space-y-3">
                                    <li className="rounded bg-[#0f151c] px-3 py-3">Dernières publications</li>
                                    <li className="rounded bg-[#0f151c] px-3 py-3">Titres suivis</li>
                                    <li className="rounded bg-[#0f151c] px-3 py-3">Recherche rapide</li>
                                </ul>
                            </div>
                        </div>
                    </aside>

                    <div>
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Fil d’actualités</h3>
                            <p className="text-sm text-[#8f98a0]">{filtered.length} élément(s)</p>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="rounded-md border border-white/10 bg-[#16202d] p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                                <h4 className="text-2xl font-bold text-white">Aucun résultat</h4>
                                <p className="mt-3 text-[#8f98a0]">
                                    Essaie un autre mot-clé dans la barre de recherche.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map((item) => {
                                    const isWatched = watchlist.includes(item.slug);

                                    return (
                                        <article
                                            key={item.id}
                                            className="overflow-hidden rounded-md border border-white/10 bg-[#16202d] shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition hover:border-[#66c0f4]/40"
                                        >
                                            <div className="h-2 w-full bg-[linear-gradient(90deg,#66c0f4_0%,#417a9b_45%,#1b2838_100%)]" />

                                            <div className="p-6">
                                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="max-w-4xl">
                                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                                            <span className="rounded bg-[#0f151c] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#8f98a0]">
                                                                {item.source}
                                                            </span>

                                                            {isWatched ? (
                                                                <span className="rounded bg-[#1f4e2f] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#a4ffb0]">
                                                                    suivi
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        <h4 className="text-2xl font-bold text-white md:text-3xl">
                                                            {item.title}
                                                        </h4>

                                                        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c7d5e0] md:text-base">
                                                            {item.summary || 'Aucun résumé disponible.'}
                                                        </p>

                                                        <div className="mt-5 flex flex-wrap items-center gap-3">
                                                            <a
                                                                href={`/game/${item.slug}`}
                                                                className="rounded bg-[#66c0f4] px-4 py-2.5 text-sm font-bold text-[#0b141b] hover:bg-[#8fd3ff]"
                                                            >
                                                                Voir la fiche du jeu
                                                            </a>

                                                            <a
                                                                href={item.article_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="rounded bg-[#2a475e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3b6687]"
                                                            >
                                                                Source externe
                                                            </a>

                                                            <button
                                                                onClick={() => toggleWatchlist(item.slug)}
                                                                className="rounded bg-[#2a475e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3b6687]"
                                                            >
                                                                {isWatched ? 'Retirer du suivi' : 'Suivre'}
                                                            </button>

                                                            <span className="rounded bg-[#0f151c] px-3 py-2 text-xs text-[#8f98a0]">
                                                                {item.slug}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 rounded bg-[#0f151c] px-3 py-2 text-xs text-[#8f98a0]">
                                                        {item.published_at
                                                            ? new Date(item.published_at).toLocaleString()
                                                            : 'Date inconnue'}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}