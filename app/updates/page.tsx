import Link from 'next/link';
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

function formatDate(value?: string | null) {
  if (!value) return 'Date inconnue';
  return new Date(value).toLocaleString('fr-FR');
}

function cleanTitle(title: string) {
  return title.replace(/^Download\s+/i, '').trim();
}

function shortSummary(summary?: string | null) {
  if (!summary) return 'Aucun résumé disponible.';
  return summary.replace(/\s+/g, ' ').trim();
}

export default async function UpdatesPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(30);

  if (error) {
    return (
      <AppShell
        title="Toutes les mises à jour"
        subtitle="Impossible de charger les données"
      >
        <div className="border border-red-500/30 bg-red-500/10 p-5 text-red-200">
          {error.message}
        </div>
      </AppShell>
    );
  }

  const updates = (data ?? []) as GameUpdate[];

  return (
    <AppShell
      title="Toutes les mises à jour"
      subtitle="Dernières pages récupérées automatiquement depuis les sources"
    >
      {updates.length === 0 ? (
        <div className="border border-[#263241] bg-[#182230] p-5 text-[#8b98a5]">
          Aucune mise à jour disponible pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {updates.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden border border-[#263241] bg-[#182230]"
            >
              <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="bg-[#111821]">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={cleanTitle(item.title)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-[#6f7c88]">
                      Image indisponible
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">
                        {item.source}
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-white">
                        {cleanTitle(item.title)}
                      </h2>

                      <p className="mt-2 text-sm text-[#8b98a5]">
                        {formatDate(item.published_at)}
                      </p>

                      <p className="mt-4 text-sm leading-7 text-[#c7d5e0]">
                        {shortSummary(item.summary)}
                      </p>

                      <p className="mt-3 text-xs text-[#6f7c88]">
                        slug : {item.slug}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 lg:w-[220px]">
                      <Link
                        href={`/game/${item.slug}`}
                        className="bg-[#66c0f4] px-4 py-2 text-center text-sm font-bold text-[#0b141b] transition hover:bg-[#8fd3ff]"
                      >
                        Voir la fiche
                      </Link>

                      <a
                        href={item.article_url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#2a475e] px-4 py-2 text-center text-sm text-white transition hover:bg-[#3b6687]"
                      >
                        Ouvrir la source
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}