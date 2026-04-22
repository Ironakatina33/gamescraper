import { notFound } from 'next/navigation';
import AppShell from '../../components/AppShell';
import WatchlistToggleButton from '../../components/WatchlistToggleButton';
import { supabase } from '../../../lib/supabase';

type Props = {
  params: Promise<{ slug: string }>;
};

function formatDate(value?: string | null) {
  if (!value) return 'Date inconnue';
  return new Date(value).toLocaleString('fr-FR');
}

export default async function GamePage({ params }: Props) {
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
  const { data: detail } = await supabase
    .from('game_details')
    .select('*')
    .eq('article_url', latest.article_url)
    .maybeSingle();

  return (
    <AppShell title={latest.title} subtitle={`Historique complet du jeu • ${latest.slug}`}>
      <div className="grid gap-4">
        <div className="border border-[#263241] bg-[#182230] p-5">
          <p className="text-sm text-[#8b98a5]">Dernière mise à jour</p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            {detail?.title ?? latest.title}
          </h2>
          <p className="mt-3 text-[#c7d5e0]">
            {detail?.about || latest.summary || 'Aucun résumé disponible.'}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={latest.article_url}
              target="_blank"
              rel="noreferrer"
              className="bg-[#66c0f4] px-4 py-2 text-sm font-bold text-[#0b141b]"
            >
              Voir la source originale
            </a>
            <WatchlistToggleButton slug={latest.slug} />
          </div>
        </div>

        {(detail?.release_name ||
          detail?.release_size ||
          detail?.developer ||
          detail?.publisher ||
          detail?.release_date ||
          detail?.genre ||
          detail?.reviews) && (
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="border border-[#263241] bg-[#182230] p-5">
              <h3 className="text-xl font-bold text-white">Infos</h3>
              <div className="mt-4 space-y-2 text-sm text-[#c7d5e0]">
                <p><strong>Nom:</strong> {detail?.release_name ?? '—'}</p>
                <p><strong>Taille:</strong> {detail?.release_size ?? '—'}</p>
                <p><strong>Développeur:</strong> {detail?.developer ?? '—'}</p>
                <p><strong>Éditeur:</strong> {detail?.publisher ?? '—'}</p>
                <p><strong>Date:</strong> {detail?.release_date ?? '—'}</p>
                <p><strong>Genre:</strong> {detail?.genre ?? '—'}</p>
                <p><strong>Avis:</strong> {detail?.reviews ?? '—'}</p>
              </div>
            </div>

            <div className="border border-[#263241] bg-[#182230] p-5">
              <h3 className="text-xl font-bold text-white">Configuration</h3>
              <pre className="mt-4 whitespace-pre-wrap text-sm text-[#c7d5e0]">
                {detail?.system_requirements ?? 'Aucune donnée'}
              </pre>
            </div>
          </section>
        )}

        {detail?.screenshots?.length > 0 && (
          <section className="border border-[#263241] bg-[#182230] p-5">
            <h3 className="text-xl font-bold text-white">Screenshots</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {detail.screenshots.map((src: string) => (
                <img
                  key={src}
                  src={src}
                  alt={detail?.title ?? latest.title}
                  className="w-full border border-[#263241] object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {detail?.trailer_url && (
          <section className="border border-[#263241] bg-[#182230] p-5">
            <h3 className="text-xl font-bold text-white">Trailer</h3>
            <video controls className="mt-4 w-full" src={detail.trailer_url} />
          </section>
        )}

        {data.map((item) => (
          <article key={item.id} className="border border-[#263241] bg-[#182230] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">
                  {item.source}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#c7d5e0]">
                  {item.summary || 'Aucun résumé disponible.'}
                </p>

                <a
                  href={item.article_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-[#66c0f4]"
                >
                  Ouvrir la source →
                </a>
              </div>

              <div className="text-sm text-[#8b98a5]">
                {formatDate(item.published_at)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}