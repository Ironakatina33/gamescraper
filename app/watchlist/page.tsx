import AppShell from '../components/AppShell';
import WatchlistClient from './WatchlistClient';
import { supabase } from '../../lib/supabase';

export default async function WatchlistPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    return (
      <AppShell title="Jeux suivis" subtitle="Liste locale des jeux sauvegardés">
        <p className="text-red-400">{error.message}</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Jeux suivis" subtitle="Stockés localement dans ton navigateur">
      <WatchlistClient updates={data ?? []} />
    </AppShell>
  );
}