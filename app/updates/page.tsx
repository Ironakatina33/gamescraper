import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GameUpdate = {
  id?: string;
  title: string;
  slug: string;
  article_url: string;
  image_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
};

export default async function Page() {
  const { data, error } = await supabase
    .from("game_updates")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(24);

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Erreur Supabase</h1>
        <pre className="mt-4">{error.message}</pre>
      </main>
    );
  }

  const games = (data ?? []) as GameUpdate[];

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Dernières mises à jour</h1>

      {games.length === 0 ? (
        <p>Aucun jeu trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <article
              key={game.article_url}
              className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900"
            >
              {game.image_url && (
                <img
                  src={game.image_url}
                  alt={game.title}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="p-4">
                <h2 className="text-xl font-semibold">{game.title}</h2>

                {game.summary && (
                  <p className="mt-2 line-clamp-4 text-sm text-neutral-300">
                    {game.summary}
                  </p>
                )}

                <div className="mt-4">
                  <Link
                    href={game.article_url}
                    target="_blank"
                    className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Voir la source
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}