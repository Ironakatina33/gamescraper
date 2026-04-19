import { supabase } from '../../lib/supabase';
import UpdatesDashboard from '../components/UpdatesDashboard';

export default async function UpdatesPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="min-h-screen bg-[#0f141a] text-white p-8">
        <h1 className="text-3xl font-bold">Erreur</h1>
        <p className="mt-3 text-red-400">{error.message}</p>
      </main>
    );
  }

  return <UpdatesDashboard updates={data ?? []} />;
}