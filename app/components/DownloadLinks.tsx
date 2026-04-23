'use client';

import { useMemo, useState } from 'react';

interface DownloadLink {
  url: string;
  text: string;
  host?: string;
}

const HOST_PRIORITY: Record<string, number> = {
  'mega': 1,
  'mediafire': 2,
  'drive': 3,
  'google': 3,
  'torrent': 4,
  '1fichier': 5,
  'uptobox': 6,
  'rapidgator': 7,
};

function hostPriority(host: string): number {
  const lower = host.toLowerCase();
  for (const [key, val] of Object.entries(HOST_PRIORITY)) {
    if (lower.includes(key)) return val;
  }
  return 99;
}

export default function DownloadLinks({ links }: { links: DownloadLink[] }) {
  const [expanded, setExpanded] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, DownloadLink[]>();
    for (const link of links) {
      const key = link.host || 'Download';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(link);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => hostPriority(a) - hostPriority(b));
  }, [links]);

  const totalHosts = grouped.length;
  const showAll = expanded || totalHosts <= 3;
  const visible = showAll ? grouped : grouped.slice(0, 3);
  const hiddenCount = totalHosts - 3;

  return (
    <div>
      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--line)]">
        {visible.map(([host, hostLinks]) => (
          <div key={host} className="border-b border-r border-[var(--line)] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--brand-hi)] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                {host}
              </span>
              <span className="mono text-[10px] text-[var(--ink-muted)]">
                {hostLinks.length} lien{hostLinks.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {hostLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-2 px-3 py-2.5 border border-[var(--line)] hover:border-[var(--brand)]/30 hover:bg-[var(--bg-elev)] transition-colors"
                >
                  <span className="text-[13px] text-[var(--ink)] truncate">{link.text}</span>
                  <span className="text-[var(--ink-muted)] group-hover:text-[var(--brand-hi)] transition-colors shrink-0">↗</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-3 mono text-[11px] uppercase tracking-[0.15em] text-[var(--ink-muted)] hover:text-[var(--brand-hi)] transition-colors flex items-center gap-2"
        >
          <span className="inline-block h-[1px] w-6 bg-[var(--line-strong)]" />
          + {hiddenCount} autre{hiddenCount > 1 ? 's' : ''} source{hiddenCount > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
