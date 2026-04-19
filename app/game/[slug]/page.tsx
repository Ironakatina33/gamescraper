import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .eq('slug', slug)
    .order('published_at', { ascending: false });

  if (error || !data || data.length === 0) {
    notFound();
  }

  const latest = data[0];

  return (
    <main className="min-h-screen bg-[#101822] text-white">
      <div className="min-h-screen bg-[linear-gradient(180deg,#1b2838_0%,#101822_32%,#0b1118_100%)]">
        <header className="border-b border-white/5 bg-[#171d25]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#66c0f4]">
              ← Retour
            </a>

            <div className="text-sm text-[#8f98a0]">
              {data.length} mise à jour{data.length > 1 ? 's' : ''}
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="overflow-hidden border border-white/10 bg-[#16202d] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
            <div className="h-3 w-full bg-[linear-gradient(90deg,#66c0f4_0%,#417a9b_45%,#1b2838_100%)]" />

            <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#8f98a0]">
                  {latest.source}
                </p>

                <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">
                  {latest.title}
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-8 text-[#c7d5e0]">
                  {latest.summary || 'Aucun résumé disponible.'}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href={latest.article_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded bg-[#66c0f4] px-4 py-2.5 text-sm font-bold text-[#0b141b] hover:bg-[#8fd3ff]"
                  >
                    Voir la source originale
                  </a>

                  <span className="rounded bg-[#0f151c] px-3 py-2 text-xs text-[#8f98a0]">
                    slug : {latest.slug}
                  </span>
                </div>
              </div>

              <div className="border border-white/10 bg-[#0f151c] p-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#66c0f4]">
                  Dernière activité
                </h2>

                <div className="mt-4 space-y-3 text-sm text-[#c7d5e0]">
                  <div>
                    <p className="text-[#8f98a0]">Date</p>
                    <p className="mt-1">
                      {latest.published_at
                        ? new Date(latest.published_at).toLocaleString()
                        : 'Date inconnue'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[#8f98a0]">Source</p>
                    <p className="mt-1">{latest.source}</p>
                  </div>

                  <div>
                    <p className="text-[#8f98a0]">Nombre d’updates</p>
                    <p className="mt-1">{data.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-white">Historique des mises à jour</h2>

            <div className="space-y-4">
              {data.map((item) => (
                <article
                  key={item.id}
                  className="border border-white/10 bg-[#16202d] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8f98a0]">
                        {item.source}
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#c7d5e0]">
                        {item.summary || 'Aucun résumé disponible.'}
                      </p>

                      <div className="mt-4">
                        <a
                          href={item.article_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-[#66c0f4] hover:text-[#8fd3ff]"
                        >
                          Ouvrir la source →
                        </a>
                      </div>
                    </div>

                    <div className="shrink-0 bg-[#0f151c] px-3 py-2 text-xs text-[#8f98a0]">
                      {item.published_at
                        ? new Date(item.published_at).toLocaleString()
                        : 'Date inconnue'}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}