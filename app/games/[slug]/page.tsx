import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function GamePage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: game, error: gameError } = await supabase
    .from("game_updates")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (gameError || !game) {
    notFound();
  }

  const { data: detail } = await supabase
    .from("game_details")
    .select("*")
    .eq("article_url", game.article_url)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-white">
      <div className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold">{detail?.title ?? game.title}</h1>

          {detail?.banner_image && (
            <img
              src={detail.banner_image}
              alt={detail.title ?? game.title}
              className="w-full rounded-3xl border border-white/10 object-cover"
            />
          )}
        </header>

        {detail?.about && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-semibold">À propos</h2>
            <p className="text-white/80">{detail.about}</p>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Infos</h2>
            <div className="space-y-2 text-white/80">
              <p><strong>Nom :</strong> {detail?.release_name ?? "—"}</p>
              <p><strong>Taille :</strong> {detail?.release_size ?? "—"}</p>
              <p><strong>Développeur :</strong> {detail?.developer ?? "—"}</p>
              <p><strong>Éditeur :</strong> {detail?.publisher ?? "—"}</p>
              <p><strong>Date :</strong> {detail?.release_date ?? "—"}</p>
              <p><strong>Genre :</strong> {detail?.genre ?? "—"}</p>
              <p><strong>Avis :</strong> {detail?.reviews ?? "—"}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Configuration</h2>
            <pre className="whitespace-pre-wrap text-sm text-white/80">
              {detail?.system_requirements ?? "Aucune donnée"}
            </pre>
          </div>
        </section>

        {detail?.trailer_url && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Trailer</h2>
            <video controls className="w-full rounded-2xl" src={detail.trailer_url} />
          </section>
        )}

        {detail?.screenshots?.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Screenshots</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {detail.screenshots.map((src: string) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="w-full rounded-2xl border border-white/10 object-cover"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}