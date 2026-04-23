'use client';

import { useEffect, useState } from 'react';

export default function GameViewTracker({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Track view
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {});

    // Fetch count
    fetch(`/api/views?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => setViews(d.views ?? 0))
      .catch(() => {});
  }, [slug]);

  if (views === null) return null;

  return (
    <span className="mono text-[11px] text-[var(--ink-muted)] flex items-center gap-1.5">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views} vue{views !== 1 ? 's' : ''}
    </span>
  );
}
