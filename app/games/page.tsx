import Link from 'next/link';
import AppShell from '../components/AppShell';
import { supabase } from '../../lib/supabase';

export const revalidate = 300;

type GameRow = {
  id: string;
  title: string;
  slug: string;
  source: string;
  image_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
};

export default async function GamesPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('id,title,slug,source,image_url,summary,published_at')
    .order('published_at', { ascending: false });

  if (error) {
    return (
      <AppShell kicker="Catalogue · 02" title="Les jeux" subtitle="Erreur de chargement">
        <p className="mono text-sm text-[var(--bad)]">✕ {error.message}</p>
      </AppShell>
    );
  }

  const rows = (data ?? []) as GameRow[];
  const latestBySlug = Array.from(
    new Map(rows.map((item) => [item.slug, item])).values()
  );

  return (
    <AppShell
      kicker="Catalogue · 02"
      title="Les jeux suivis"
      subtitle={`${latestBySlug.length} jeux dans la collection, dérivés des ${rows.length} dernières updates.`}
      eyebrow={
        <div className="md:border-l md:border-[var(--line)] md:pl-8">
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-1.5">
            Total
          </p>
          <p className="mono text-2xl text-[var(--ink)]">
            {latestBySlug.length.toString().padStart(3, '0')}
          </p>
        </div>
      }
    >
      {latestBySlug.length === 0 ? (
        <div className="border border-dashed border-[var(--line-strong)] p-16 text-center">
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-3">
            — Empty —
          </p>
          <p className="text-[var(--ink-dim)]">
            Aucun jeu dans la base pour l&apos;instant.
          </p>
        </div>
      ) : (
        <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--line)]">
          {latestBySlug.map((item, idx) => (
            <Link
              key={item.slug}
              href={`/game/${item.slug}`}
              className="group relative border-b border-r border-[var(--line)] p-5 hover:bg-[var(--bg-elev)] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="mono text-[11px] text-[var(--ink-muted)]">
                  {(idx + 1).toString().padStart(3, '0')}
                </span>
                <span className="text-[var(--ink-muted)] group-hover:text-[var(--brand-hi)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  ↗
                </span>
              </div>
              {item.image_url ? (
                <div className="relative aspect-[16/10] mb-5 overflow-hidden bg-[var(--bg-elev)] border border-[var(--line)]">
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] mb-5 grid place-items-center border border-dashed border-[var(--line-strong)] bg-[var(--bg-elev)]">
                  <span className="mono text-[10px] uppercase text-[var(--ink-muted)]">
                    no image
                  </span>
                </div>
              )}
              <p className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--brand-hi)] mb-2">
                {item.source}
              </p>
              <h2 className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--brand-hi)] transition-colors">
                {item.title}
              </h2>
              <p className="mt-2 mono text-[11px] text-[var(--ink-muted)]">
                {item.slug}
              </p>
              <p className="mt-4 mono text-[11px] text-[var(--ink-muted)]">
                {item.published_at
                  ? new Date(item.published_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}