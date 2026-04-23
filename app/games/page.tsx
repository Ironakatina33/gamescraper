import AppShell from '../components/AppShell';
import GamesClient from './GamesClient';
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
  const sourcesCount = new Set(latestBySlug.map((g) => g.source)).size;

  return (
    <AppShell
      kicker="Catalogue · 02"
      title="Les jeux suivis"
      subtitle={`${latestBySlug.length} jeux dans la collection, dérivés des ${rows.length} dernières updates.`}
      eyebrow={
        <div className="flex items-center gap-6 md:border-l md:border-[var(--line)] md:pl-8">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-1.5">Total</p>
            <p className="mono text-2xl text-[var(--ink)]">{latestBySlug.length.toString().padStart(3, '0')}</p>
          </div>
          <div className="border-l border-[var(--line)] pl-6">
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-1.5">Sources</p>
            <p className="mono text-2xl text-[var(--ink)]">{sourcesCount.toString().padStart(2, '0')}</p>
          </div>
        </div>
      }
    >
      <GamesClient games={latestBySlug} />
    </AppShell>
  );
}