'use client';

import { useEffect, useState } from 'react';
import { ui } from '../../lib/ui';

type Props = {
  slug: string;
};

function getSavedWatchlist() {
  try {
    const raw = localStorage.getItem('watchlist-games');
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function WatchlistToggleButton({ slug }: Props) {
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    setFollowed(getSavedWatchlist().includes(slug));
  }, [slug]);

  function toggle() {
    const current = getSavedWatchlist();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];
    localStorage.setItem('watchlist-games', JSON.stringify(next));
    setFollowed(next.includes(slug));
  }

  return (
    <button
      onClick={toggle}
      className={followed ? ui.buttonWatchRemove : ui.buttonWatchAdd}
    >
      {followed ? 'Retirer de ma watchlist' : 'Ajouter a ma watchlist'}
    </button>
  );
}
