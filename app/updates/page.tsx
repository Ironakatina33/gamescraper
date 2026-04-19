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

function cleanTitle(title: string) {
  return title
    .replace(/^Download\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSummary(summary?: string | null) {
  if (!summary) return "Aucune description disponible.";

  return summary
    .replace(/\s+/g, " ")
    .replace(/Game Details/gi, "")
    .replace(/RELEASE NAME:/gi, "Nom :")
    .replace(/RELEASE SIZE:/gi, "Taille :")
    .replace(/DEVELOPER:/gi, "Développeur :")
    .replace(/PUBLISHER:/gi, "Éditeur :")
    .replace(/RELEASE DATE:/gi, "Date :")
    .replace(/GENRE:/gi, "Genre :")
    .replace(/ALL REVIEWS:/gi, "Avis :")
    .trim();
}

function formatRelativeDate(date?: string | null) {
  if (!date) return "Date inconnue";

  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "À l’instant";
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays < 30) return `Il y a ${diffDays} j`;

  return then.toLocaleDateString("fr-FR");
}

export default async function UpdatesPage() {
  const { data, error } = await supabase
    .from("game_updates")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(24);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-white">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <h1 className="text-2xl font-bold">Erreur de chargement</h1>
          <p className="mt-3 text-red-200">{error.message}</p>
        </div>
      </main>
    );
  }

  const games = (data ?? []) as GameUpdate[];

  return (
    <main className="min-h-screen bg-[#0b0f16] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-[#101826] to-[#0b0f16]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-red-300">
              Mises à jour jeux
            </span>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Dernières mises à jour
            </h1>

            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Retrouve les derniers jeux et mises à jour récupérés automatiquement.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {games.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            Aucun jeu trouvé.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (
              <article
                key={game.article_url}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-red-500/40"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-black">
                  {game.image_url ? (
                    <img
                      src={game.image_url}
                      alt={cleanTitle(game.title)}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/40">
                      Image indisponible
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                      {formatRelativeDate(game.published_at)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-2 text-2xl font-bold leading-tight text-white">
                    {cleanTitle(game.title)}
                  </h2>

                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/70">
                    {cleanSummary(game.summary)}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Link
                      href={game.article_url}
                      target="_blank"
                      className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      Voir la source
                    </Link>

                    <span className="truncate text-xs uppercase tracking-wider text-white/35">
                      {game.slug}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}