import { supabase } from '@/lib/supabase';

export default async function HomePage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(30);

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Erreur</h1>
          <p>{error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dernières mises à jour de jeux</h1>

        <div className="grid gap-4">
          {data?.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400 mb-2">{item.source}</p>
              <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
              {item.summary ? (
                <p className="text-zinc-300 mb-3">{item.summary}</p>
              ) : null}
              <div className="text-sm text-zinc-500">
                {item.published_at ? new Date(item.published_at).toLocaleString() : 'Date inconnue'}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}