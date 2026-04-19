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
    .replace(/RELEASE NAME:/gi, "")
    .replace(/RELEASE SIZE:/gi, "Taille :")
    .replace(/DEVELOPER:/gi, "Développeur :")
    .replace(/PUBLISHER:/gi, "Éditeur :")
    .replace(/RELEASE DATE:/gi, "Date :")
    .replace(/GENRE:/gi, "Genre :")
    .replace(/ALL REVIEWS:/gi, "Avis :")
    .replace(/♂/g, "")
    .trim();
}

function formatRelativeDate(date?: string | null) {
  if (!date) return "Date inconnue";

  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();

  if (Number.isNaN(then.getTime())) return "Date inconnue";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "À l’instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays < 30) return `Il y a ${diffDays} j`;

  return then.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getShortSummary(summary?: string | null) {
  const cleaned = cleanSummary(summary);
  if (cleaned.length <= 180) return cleaned;
  return `${cleaned.slice(0, 180).trim()}…`;
}

export default async function UpdatesPage() {
  const { data, error } = await supabase
    .from("game_updates")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(24);

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0f1a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
              Erreur
            </p>
            <h1 className="mt-3 text-3xl font-bold">Impossible de charger les mises à jour</h1>
            <p className="mt-4 text-white/75">{error.message}</p>
          </div>
        </div>
      </main>
    );
  }

  const games = (data ?? []) as GameUpdate[];
  const featuredGames = games.slice(0, 3);
  const otherGames = games.slice(3);

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_26%),linear-gradient(180deg,_#101726_0%,_#0a0f1a_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-red-400/25 bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-red-300">
              Updates
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Dernières mises à jour jeux
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Consulte rapidement les nouveaux ajouts, les builds récents et les
              dernières pages récupérées automatiquement.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Retour à l’accueil
              </Link>

              <Link
                href="/games"
                className="inline-flex items-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Voir tous les jeux
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-300">
              À la une
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Les plus récentes
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65">
            {games.length} résultat{games.length > 1 ? "s" : ""}
          </div>
        </div>

        {games.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
            Aucun jeu trouvé pour le moment.
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-12">
              {featuredGames.map((game, index) => (
                <article
                  key={game.article_url}
                  className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f1724] transition duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)] ${
                    index === 0 ? "lg:col-span-6" : "lg:col-span-3"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black">
                    {game.image_url ? (
                      <img
                        src={game.image_url}
                        alt={cleanTitle(game.title)}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/40">
                        Image indisponible
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/20 to-transparent" />

                    <div className="absolute left-4 top-4">
                      <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                        {formatRelativeDate(game.published_at)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-2xl font-bold leading-tight text-white">
                      {cleanTitle(game.title)}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-white/72">
                      {getShortSummary(game.summary)}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <Link
                        href={game.article_url}
                        target="_blank"
                        className="inline-flex items-center rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                      >
                        Voir la source
                      </Link>

                      <span className="truncate text-xs uppercase tracking-[0.14em] text-white/35">
                        {game.slug}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {otherGames.length > 0 && (
              <>
                <div className="mt-12 mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-300">
                    Catalogue
                  </p>
                  <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                    Plus de mises à jour
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {otherGames.map((game) => (
                    <article
                      key={game.article_url}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0f1724] transition duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-black">
                        {game.image_url ? (
                          <img
                            src={game.image_url}
                            alt={cleanTitle(game.title)}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-white/40">
                            Image indisponible
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/10 to-transparent" />

                        <div className="absolute left-4 top-4">
                          <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                            {formatRelativeDate(game.published_at)}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="line-clamp-2 text-xl font-bold leading-tight text-white">
                          {cleanTitle(game.title)}
                        </h3>

                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/72">
                          {getShortSummary(game.summary)}
                        </p>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <Link
                            href={game.article_url}
                            target="_blank"
                            className="inline-flex items-center rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                          >
                            Voir la source
                          </Link>

                          <span className="truncate text-xs uppercase tracking-[0.14em] text-white/35">
                            {game.slug}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}