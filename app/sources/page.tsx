import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// Standalone page without AppShell to avoid ThemeProvider issues during build
export default async function SourcesPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('source');

  const cardClass = 'rounded-xl border border-[#263241] bg-[#111b28] p-4';

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b1118] text-white">
        <header className="border-b border-[#1e2d3d] bg-[#111b28]">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-[#66c0f4]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h.01M6 14h.01" />
              </svg>
              GameScraper
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-3xl font-black text-white mb-2">Sources</h1>
          <p className="text-red-400">{error.message}</p>
        </main>
      </div>
    );
  }

  const grouped = Object.entries(
    (data ?? []).reduce((acc: Record<string, number>, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const total = grouped.reduce((acc, [, count]) => acc + count, 0);

  return (
    <div className="min-h-screen bg-[#0b1118] text-white">
      <header className="border-b border-[#1e2d3d] bg-[#111b28]">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-[#66c0f4]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M6 14h.01" />
            </svg>
            GameScraper
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-1">Sources</h1>
        <p className="text-[#8b98a5] mb-6">Répartition des sources en base</p>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Sources actives</p>
            <p className="mt-2 text-2xl font-black text-white">{grouped.length}</p>
          </div>
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Entrees totales</p>
            <p className="mt-2 text-2xl font-black text-white">{total}</p>
          </div>
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Tri</p>
            <p className="mt-2 text-2xl font-black text-[#66c0f4]">Volume desc</p>
          </div>
        </div>

        <div className="grid gap-3">
          {grouped.map(([source, count]) => (
            <div key={source} className={cardClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{source}</h2>
                <span className="text-sm text-[#8b98a5]">{count} entrée(s)</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}