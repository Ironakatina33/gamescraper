'use client';

import Link from 'next/link';
import { useMemo, useState, useRef } from 'react';
import { ui } from '../../lib/ui';
import { useToast } from '../components/ToastContext';

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
  const { showSuccess, showError, showInfo } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    showSuccess('Jeu retiré de la watchlist');
  }

  function exportWatchlist() {
    const data = {
      watchlist,
      seenBySlug,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamescraper-watchlist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Watchlist exportée avec succès');
  }

  function importWatchlist(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.watchlist && Array.isArray(data.watchlist)) {
          setWatchlist(data.watchlist);
          localStorage.setItem('watchlist-games', JSON.stringify(data.watchlist));
          if (data.seenBySlug) {
            setSeenBySlug(data.seenBySlug);
            localStorage.setItem('watchlist-seen-by-slug', JSON.stringify(data.seenBySlug));
          }
          showSuccess(`${data.watchlist.length} jeux importés avec succès`);
        } else {
          showError('Format de fichier invalide');
        }
      } catch {
        showError('Impossible de lire le fichier');
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }

  function markAsSeen(slug: string, publishedAt?: string | null) {
    const seenValue = publishedAt ?? new Date().toISOString();
    const next = { ...seenBySlug, [slug]: seenValue };
    setSeenBySlug(next);
    localStorage.setItem('watchlist-seen-by-slug', JSON.stringify(next));
    showInfo('Marqué comme vu');
  }

  function markAllAsSeen() {
    const next = { ...seenBySlug };
    for (const item of watched) {
      next[item.slug] = item.published_at ?? new Date().toISOString();
    }
    setSeenBySlug(next);
    localStorage.setItem('watchlist-seen-by-slug', JSON.stringify(next));
    showSuccess(`${watched.length} jeux marqués comme vus`);
  }

  if (watched.length === 0) {
    return (
      <div className={`${ui.card} p-6 text-[#8b98a5]`}>
        <p className="mb-4">Aucun jeu suivi localement. Ajoute des jeux depuis la page des mises à jour.</p>
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={ui.buttonSecondary}
          >
            Importer une watchlist
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importWatchlist}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className={`${ui.cardSoft} flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}>
        <p className="text-sm text-[#8b98a5]">
          {watched.length} jeu{watched.length > 1 ? 'x' : ''} suivi{watched.length > 1 ? 's' : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportWatchlist}
            className={ui.buttonSecondary}
          >
            Exporter
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={ui.buttonSecondary}
          >
            Importer
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importWatchlist}
            className="hidden"
          />
        </div>
      </div>
      <div className={`${ui.cardSoft} flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#8b98a5]">
            Nouveautés watchlist
          </p>
          <p className="mt-1 text-sm text-white">
            {newCount} mise{newCount > 1 ? 's' : ''} à jour non lue{newCount > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={markAllAsSeen}
          className={ui.buttonSecondary}
          disabled={newCount === 0}
        >
          Tout marquer comme lu
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