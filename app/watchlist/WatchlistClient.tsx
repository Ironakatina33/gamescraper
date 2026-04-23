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
      <div className="border border-dashed border-[var(--line-strong)] p-12 md:p-16 text-center">
        <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-4">
          — Watchlist vide —
        </p>
        <p className="text-[var(--ink-dim)] mb-6 max-w-md mx-auto">
          Tu ne suis aucun jeu pour l&apos;instant. Ajoute-en depuis la page
          des updates, ou importe une watchlist existante.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/updates" className={ui.buttonPrimary}>
            Parcourir les updates →
          </Link>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={ui.buttonSecondary}
          >
            Importer un .json
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
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-end gap-6">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-1">
              Jeux suivis
            </p>
            <p className="mono text-3xl text-[var(--ink)]">
              {watched.length.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="border-l border-[var(--line)] pl-6">
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-1">
              Non lues
            </p>
            <p className={`mono text-3xl ${newCount > 0 ? 'text-[var(--brand-hi)]' : 'text-[var(--ink)]'}`}>
              {newCount.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={markAllAsSeen} disabled={newCount === 0} className={`${ui.buttonGhost} border border-[var(--line-strong)] disabled:opacity-40 disabled:cursor-not-allowed`}>
            Tout marquer lu
          </button>
          <button onClick={exportWatchlist} className={ui.buttonSecondary}>
            ↓ Exporter
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={ui.buttonSecondary}
          >
            ↑ Importer
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

      {/* List */}
      <ul className="divide-y divide-[var(--line)]">
        {watchedWithStatus.map((item, idx) => (
          <li
            key={item.slug}
            className="group grid gap-5 py-5 md:grid-cols-[40px_140px_1fr_auto] md:items-center hover:bg-[var(--bg-elev)] transition-colors -mx-3 px-3"
          >
            <span className="mono text-[11px] text-[var(--ink-muted)]">
              {(idx + 1).toString().padStart(3, '0')}
            </span>
            <Link
              href={`/game/${item.slug}`}
              className="relative block h-[80px] w-full md:w-[140px] overflow-hidden border border-[var(--line)] bg-[var(--bg-elev)]"
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
            <div className="min-w-0">
              <p className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--brand-hi)] mb-1.5">
                {item.source}
              </p>
              <Link
                href={`/game/${item.slug}`}
                className="text-[16px] font-medium tracking-[-0.01em] text-[var(--ink)] hover:text-[var(--brand-hi)] transition-colors"
              >
                {item.title}
              </Link>
              <p className="mt-1 mono text-[11px] text-[var(--ink-muted)]">
                {item.slug}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {item.isNew && (
                <button
                  onClick={() => markAsSeen(item.slug, item.published_at)}
                  className="text-[12px] py-2 px-3 text-[var(--ink-dim)] hover:text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--ink-dim)] transition-colors"
                >
                  ✓ Lu
                </button>
              )}
              <button
                onClick={() => remove(item.slug)}
                className="text-[12px] py-2 px-3 text-[var(--bad)] hover:bg-[var(--bad)]/10 border border-[var(--bad)]/30 transition-colors"
              >
                − Retirer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}