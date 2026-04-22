import UpdatesDashboard from '../components/UpdatesDashboard';
import AppShell from '../components/AppShell';
import { supabase } from '../../lib/supabase';

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

export default async function UpdatesPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(80);

  if (error) {
    return (
      <AppShell
        title="Toutes les mises a jour"
        subtitle="Impossible de charger les donnees"
      >
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
          {error.message}
        </div>
      </AppShell>
    );
  }

  const updates = (data ?? []) as GameUpdate[];

  return <UpdatesDashboard updates={updates} />;
}