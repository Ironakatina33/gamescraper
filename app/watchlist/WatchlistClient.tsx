'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ui } from '../../lib/ui';

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

export default function WatchlistClient({ updates }: Props) {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('watchlist-games');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [seenBySlug, setSeenBySlug] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const seenRaw = localStorage.getItem('watchlist-seen-by-slug');
      return seenRaw ? JSON.parse(seenRaw) : {};
    } catch {
      return {};
    }
  });

  const latestBySlug = useMemo(() => {
    return Array.from(
      new Map(updates.map((item) => [item.slug, item])).values()
    );
  }, [updates]);

  const watched = latestBySlug.filter((item) => watchlist.includes(item.slug));
  const sortedWatched = [...watched].sort((a, b) => {
    const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
    return bTime - aTime;
  });

  const watchedWithStatus = sortedWatched.map((item) => {
    const seenAt = seenBySlug[item.slug];
    const publishedAt = item.published_at ?? null;
    const isNew = Boolean(
      publishedAt &&
        (!seenAt || new Date(publishedAt).getTime() > new Date(seenAt).getTime())
    );

    return { ...item, isNew };
  });

  const newCount = watchedWithStatus.filter((item) => item.isNew).length;

  function remove(slug: string) {
    const next = watchlist.filter((item) => item !== slug);
    setWatchlist(next);
    localStorage.setItem('watchlist-games', JSON.stringify(next));
  }

  function markAsSeen(slug: string, publishedAt?: string | null) {
    const seenValue = publishedAt ?? new Date().toISOString();
    const next = { ...seenBySlug, [slug]: seenValue };
    setSeenBySlug(next);
    localStorage.setItem('watchlist-seen-by-slug', JSON.stringify(next));
  }

  function markAllAsSeen() {
    const next = { ...seenBySlug };
    for (const item of watched) {
      next[item.slug] = item.published_at ?? new Date().toISOString();
    }
    setSeenBySlug(next);
    localStorage.setItem('watchlist-seen-by-slug', JSON.stringify(next));
  }

  if (watched.length === 0) {
    return (
      <div className={`${ui.card} p-6 text-[#8b98a5]`}>
        Aucun jeu suivi localement. Ajoute des jeux depuis la page des mises a jour.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className={`${ui.cardSoft} flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#8b98a5]">
            Nouveautes watchlist
          </p>
          <p className="mt-1 text-sm text-white">
            {newCount} update(s) non lue(s)
          </p>
        </div>
        <button
          onClick={markAllAsSeen}
          className={ui.buttonSecondary}
        >
          Tout marquer comme vu
        </button>
      </div>

      {watchedWithStatus.map((item) => (
        <div key={item.slug} className={`${ui.card} p-4`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="mb-3 h-28 w-full max-w-md rounded-lg border border-[#2a3b4f] object-cover"
                />
              ) : null}
              <div className="flex items-center gap-2">
                <Link href={`/game/${item.slug}`} className="text-lg font-semibold text-white hover:text-[#66c0f4]">
                  {item.title}
                </Link>
                {item.isNew && (
                  <span className="bg-[#66c0f4] px-2 py-0.5 text-xs font-bold text-[#0b141b]">
                    NEW
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-[#8b98a5]">{item.slug}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#6f7c88]">
                {item.source}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => markAsSeen(item.slug, item.published_at)}
                className={ui.buttonSecondary}
              >
                Marquer vu
              </button>
              <button
                onClick={() => remove(item.slug)}
                className={ui.buttonWatchRemove}
              >
                Retirer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}