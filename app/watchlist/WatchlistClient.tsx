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

type SortMode = 'recent' | 'rating' | 'alpha';

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}

function setStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function CollectionClient({ updates }: Props) {
  const { showSuccess, showError, showInfo } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collection, setCollection] = useState<string[]>(() => getStorage('watchlist-games', []));
  const [seenBySlug, setSeenBySlug] = useState<Record<string, string>>(() => getStorage('watchlist-seen-by-slug', {}));
  const [ratings, setRatings] = useState<Record<string, number>>(() => getStorage('collection-ratings', {}));
  const [notes, setNotes] = useState<Record<string, string>>(() => getStorage('collection-notes', {}));
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');

  const latestBySlug = useMemo(() => {
    return Array.from(
      new Map(updates.map((item) => [item.slug, item])).values()
    );
  }, [updates]);

  const watched = latestBySlug.filter((item) => collection.includes(item.slug));

  const sortedWatched = useMemo(() => {
    const list = [...watched];
    if (sort === 'rating') {
      list.sort((a, b) => (ratings[b.slug] || 0) - (ratings[a.slug] || 0));
    } else if (sort === 'alpha') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => {
        const at = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bt = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bt - at;
      });
    }
    return list;
  }, [watched, sort, ratings]);

  const watchedWithStatus = sortedWatched.map((item) => {
    const seenAt = seenBySlug[item.slug];
    const publishedAt = item.published_at ?? null;
    const isNew = Boolean(
      publishedAt && (!seenAt || new Date(publishedAt).getTime() > new Date(seenAt).getTime())
    );
    return { ...item, isNew };
  });

  const newCount = watchedWithStatus.filter((item) => item.isNew).length;

  function remove(slug: string) {
    const next = collection.filter((item) => item !== slug);
    setCollection(next);
    setStorage('watchlist-games', next);
    showSuccess('Jeu retiré de la collection');
  }

  function setRating(slug: string, value: number) {
    const current = ratings[slug];
    const next = { ...ratings, [slug]: current === value ? 0 : value };
    setRatings(next);
    setStorage('collection-ratings', next);
  }

  function startEditNote(slug: string) {
    setEditingNote(slug);
    setNoteInput(notes[slug] || '');
  }

  function saveNote(slug: string) {
    const next = { ...notes, [slug]: noteInput.trim() };
    if (!noteInput.trim()) delete next[slug];
    setNotes(next);
    setStorage('collection-notes', next);
    setEditingNote(null);
    setNoteInput('');
  }

  function exportCollection() {
    const data = { collection, seenBySlug, ratings, notes, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamescraper-collection-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Collection exportée');
  }

  function importCollection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const list = data.collection ?? data.watchlist;
        if (list && Array.isArray(list)) {
          setCollection(list);
          setStorage('watchlist-games', list);
          if (data.seenBySlug) { setSeenBySlug(data.seenBySlug); setStorage('watchlist-seen-by-slug', data.seenBySlug); }
          if (data.ratings) { setRatings(data.ratings); setStorage('collection-ratings', data.ratings); }
          if (data.notes) { setNotes(data.notes); setStorage('collection-notes', data.notes); }
          showSuccess(`${list.length} jeux importés`);
        } else { showError('Format invalide'); }
      } catch { showError('Fichier illisible'); }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  }

  function markAsSeen(slug: string, publishedAt?: string | null) {
    const next = { ...seenBySlug, [slug]: publishedAt ?? new Date().toISOString() };
    setSeenBySlug(next);
    setStorage('watchlist-seen-by-slug', next);
    showInfo('Marqué comme lu');
  }

  function markAllAsSeen() {
    const next = { ...seenBySlug };
    for (const item of watched) next[item.slug] = item.published_at ?? new Date().toISOString();
    setSeenBySlug(next);
    setStorage('watchlist-seen-by-slug', next);
    showSuccess(`${watched.length} jeux marqués comme lus`);
  }

  if (watched.length === 0) {
    return (
      <div className="border border-dashed border-[var(--line-strong)] p-12 md:p-16 text-center">
        <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-4">
          — Collection vide —
        </p>
        <p className="text-[var(--ink-dim)] mb-6 max-w-md mx-auto">
          Tu ne suis aucun jeu pour l&apos;instant. Ajoute-en depuis la page
          des updates, ou importe une collection existante.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/updates" className={ui.buttonPrimary}>
            Parcourir les updates →
          </Link>
          <button onClick={() => fileInputRef.current?.click()} className={ui.buttonSecondary}>
            Importer un .json
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={importCollection} className="hidden" />
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
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-1">Jeux suivis</p>
            <p className="mono text-3xl text-[var(--ink)]">{watched.length.toString().padStart(2, '0')}</p>
          </div>
          <div className="border-l border-[var(--line)] pl-6">
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-1">Non lues</p>
            <p className={`mono text-3xl ${newCount > 0 ? 'text-[var(--brand-hi)]' : 'text-[var(--ink)]'}`}>
              {newCount.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="border-l border-[var(--line)] pl-6">
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-1">Tri</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="mono text-[12px] bg-transparent text-[var(--ink)] border border-[var(--line-strong)] px-2 py-1 outline-none cursor-pointer"
            >
              <option value="recent">Récent</option>
              <option value="rating">Note ★</option>
              <option value="alpha">A → Z</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={markAllAsSeen} disabled={newCount === 0}
            className={`${ui.buttonGhost} border border-[var(--line-strong)] disabled:opacity-40 disabled:cursor-not-allowed`}>
            Tout marquer lu
          </button>
          <button onClick={exportCollection} className={ui.buttonSecondary}>↓ Exporter</button>
          <button onClick={() => fileInputRef.current?.click()} className={ui.buttonSecondary}>↑ Importer</button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={importCollection} className="hidden" />
        </div>
      </div>

      {/* List */}
      <ul className="divide-y divide-[var(--line)]">
        {watchedWithStatus.map((item, idx) => (
          <li key={item.slug} className="group py-5 hover:bg-[var(--bg-elev)] transition-colors -mx-3 px-3">
            <div className="grid gap-5 md:grid-cols-[40px_140px_1fr_auto] md:items-center">
              <span className="mono text-[11px] text-[var(--ink-muted)]">
                {(idx + 1).toString().padStart(3, '0')}
              </span>
              <Link href={`/game/${item.slug}`}
                className="relative block h-[80px] w-full md:w-[140px] overflow-hidden border border-[var(--line)] bg-[var(--bg-elev)]">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center mono text-[10px] uppercase text-[var(--ink-muted)]">no image</div>
                )}
                {item.isNew && (
                  <span className="absolute top-1.5 left-1.5 mono text-[9px] uppercase tracking-[0.2em] bg-[var(--brand)] text-white px-1.5 py-0.5">New</span>
                )}
              </Link>
              <div className="min-w-0">
                <p className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--brand-hi)] mb-1.5">
                  {item.source}
                </p>
                <Link href={`/game/${item.slug}`}
                  className="text-[16px] font-medium tracking-[-0.01em] text-[var(--ink)] hover:text-[var(--brand-hi)] transition-colors">
                  {item.title}
                </Link>
                {/* Star rating */}
                <div className="mt-1.5 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(item.slug, star)}
                      className={`text-[16px] transition-colors ${star <= (ratings[item.slug] || 0) ? 'text-[#f59e0b]' : 'text-[var(--line-strong)] hover:text-[#f59e0b]/50'}`}>
                      ★
                    </button>
                  ))}
                  {ratings[item.slug] ? (
                    <span className="mono text-[10px] text-[var(--ink-muted)] ml-1.5">{ratings[item.slug]}/5</span>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEditNote(item.slug)}
                  className="text-[12px] py-2 px-3 text-[var(--ink-dim)] hover:text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--ink-dim)] transition-colors">
                  {notes[item.slug] ? '✎ Note' : '+ Note'}
                </button>
                {item.isNew && (
                  <button onClick={() => markAsSeen(item.slug, item.published_at)}
                    className="text-[12px] py-2 px-3 text-[var(--ink-dim)] hover:text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--ink-dim)] transition-colors">
                    ✓ Lu
                  </button>
                )}
                <button onClick={() => remove(item.slug)}
                  className="text-[12px] py-2 px-3 text-[var(--bad)] hover:bg-[var(--bad)]/10 border border-[var(--bad)]/30 transition-colors">
                  −
                </button>
              </div>
            </div>

            {/* Note display / edit */}
            {editingNote === item.slug ? (
              <div className="mt-3 ml-0 md:ml-[180px] flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveNote(item.slug)}
                  placeholder="Ajoute une note personnelle..."
                  maxLength={500}
                  autoFocus
                  className="flex-1 border border-[var(--line)] bg-transparent px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] focus:border-[var(--brand)]"
                />
                <button onClick={() => saveNote(item.slug)}
                  className="text-[12px] px-3 py-2 bg-[var(--brand)] text-white hover:bg-[var(--brand-hi)] transition-colors">
                  OK
                </button>
                <button onClick={() => setEditingNote(null)}
                  className="text-[12px] px-3 py-2 text-[var(--ink-muted)] hover:text-[var(--ink)] border border-[var(--line-strong)] transition-colors">
                  ✕
                </button>
              </div>
            ) : notes[item.slug] ? (
              <p className="mt-2 ml-0 md:ml-[180px] text-[13px] text-[var(--ink-dim)] italic cursor-pointer hover:text-[var(--ink)] transition-colors"
                onClick={() => startEditNote(item.slug)}>
                📝 {notes[item.slug]}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}