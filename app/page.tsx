import { supabase } from '../lib/supabase';

type SearchParams = Promise<{
  q?: string;
  sort?: string;
}>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = (params.q ?? '').trim().toLowerCase();
  const sort = params.sort ?? 'newest';

  let request = supabase.from('game_updates').select('*');

  if (sort === 'oldest') {
    request = request.order('published_at', { ascending: true });
  } else {
    request = request.order('published_at', { ascending: false });
  }

  const { data, error } = await request.limit(50);

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

  const filtered =
    data?.filter((item) => {
      if (!query) return true;

      const title = item.title?.toLowerCase() ?? '';
      const summary = item.summary?.toLowerCase() ?? '';
      const source = item.source?.toLowerCase() ?? '';

      return (
        title.includes(query) ||
        summary.includes(query) ||
        source.includes(query)
      );
    }) ?? [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400 mb-3">
            Game Updates
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dernières mises à jour de jeux
          </h1>
          <p className="text-zinc-400 max-w-2xl text-lg">
            Un tableau de bord simple pour suivre les dernières mises à jour enregistrées.
          </p>

          <form className="mt-8 grid gap-4 md:grid-cols-[1fr_220px_160px]">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Rechercher un jeu, une source, un résumé..."
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-zinc-500"
            />

            <select
              name="sort"
              defaultValue={sort}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-zinc-500"
            >
              <option value="newest">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
            </select>

            <button
              type="submit"
              className="rounded-2xl bg-white text-black font-semibold px-4 py-3 hover:bg-zinc-200 transition"
            >
              Appliquer
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-zinc-400">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </p>

          {query ? (
            <a
              href="/"
              className="text-sm text-zinc-300 hover:text-white underline underline-offset-4"
            >
              Réinitialiser la recherche
            </a>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Aucun résultat</h2>
            <p className="text-zinc-400">
              Essaie un autre mot-clé ou ajoute de nouvelles mises à jour.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg shadow-black/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
                      {item.source}
                    </p>
                    <h2 className="text-2xl font-semibold leading-tight">
                      {item.title}
                    </h2>
                  </div>

                  <div className="text-sm text-zinc-500">
                    {item.published_at
                      ? new Date(item.published_at).toLocaleString()
                      : 'Date inconnue'}
                  </div>
                </div>

                {item.summary ? (
                  <p className="text-zinc-300 leading-7 mb-4">{item.summary}</p>
                ) : (
                  <p className="text-zinc-500 italic mb-4">Aucun résumé disponible.</p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={item.article_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:bg-white transition"
                  >
                    Voir la source
                  </a>

                  <span className="rounded-xl border border-zinc-700 px-3 py-2 text-xs text-zinc-400">
                    slug : {item.slug}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}