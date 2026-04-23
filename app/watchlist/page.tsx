import AppShell from '../components/AppShell';
import WatchlistClient from './WatchlistClient';
import { supabase } from '../../lib/supabase';

export const revalidate = 120;

export default async function WatchlistPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    return (
      <AppShell
        kicker="Watchlist · 03"
        title="Tes jeux suivis"
        subtitle="Liste locale — stockée dans ton navigateur, jamais côté serveur."
      >
        <p className="mono text-sm text-[var(--bad)]">✕ {error.message}</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      kicker="Watchlist · 03"
      title="Tes jeux suivis"
      subtitle="Rien n'est stocké côté serveur. Tu peux exporter ta liste pour la transférer ailleurs."
    >
      <WatchlistClient updates={data ?? []} />
    </AppShell>
  );
}