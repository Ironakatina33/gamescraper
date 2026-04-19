import { supabase } from '../lib/supabase';
import UpdatesDashboard from './components/UpdatesDashboard';

export default async function HomePage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Erreur</h1>
          <p className="text-red-400">{error.message}</p>
        </div>
      </main>
    );
  }

  return <UpdatesDashboard updates={data ?? []} />;
}