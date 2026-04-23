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
        kicker="Collection · 03"
        title="Ma collection"
        subtitle="Ta bibliothèque personnelle — stockée dans ton navigateur, jamais côté serveur."
      >
        <p className="mono text-sm text-[var(--bad)]">✕ {error.message}</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      kicker="Collection · 03"
      title="Ma collection"
      subtitle="Ajoute des notes, une note sur 5 et suis les mises à jour de tes jeux préférés. Exporte ta liste à tout moment."
    >
      <WatchlistClient updates={data ?? []} />
    </AppShell>
  );
}