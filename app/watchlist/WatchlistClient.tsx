'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type GameUpdate = {
  id: string;
  title: string;
  slug: string;
  source: string;
  article_url: string;
  summary?: string | null;
  published_at?: string | null;
};

type Props = {
  updates: GameUpdate[];
};

export default function WatchlistClient({ updates }: Props) {
  const [watchlist, setWatchlist] = useState<string[]>([]);

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

  const latestBySlug = useMemo(() => {
    return Array.from(
      new Map(updates.map((item) => [item.slug, item])).values()
    );
  }, [updates]);

  const watched = latestBySlug.filter((item) => watchlist.includes(item.slug));

  function remove(slug: string) {
    const next = watchlist.filter((item) => item !== slug);
    setWatchlist(next);
    localStorage.setItem('watchlist-games', JSON.stringify(next));
  }

  if (watched.length === 0) {
    return (
      <div className="border border-[#263241] bg-[#182230] p-5 text-[#8b98a5]">
        Aucun jeu suivi localement.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {watched.map((item) => (
        <div key={item.slug} className="border border-[#263241] bg-[#182230] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link href={`/game/${item.slug}`} className="text-lg font-semibold text-white hover:text-[#66c0f4]">
                {item.title}
              </Link>
              <p className="mt-1 text-sm text-[#8b98a5]">{item.slug}</p>
            </div>

            <button
              onClick={() => remove(item.slug)}
              className="bg-[#2a475e] px-3 py-2 text-sm text-white hover:bg-[#3b6687]"
            >
              Retirer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}