import { notFound } from 'next/navigation';
import AppShell from '../../components/AppShell';
import WatchlistToggleButton from '../../components/WatchlistToggleButton';
import { supabase } from '../../../lib/supabase';
import { parseGameDetail, type ParsedGameDetail } from '../../../lib/parseGameDetail';
import { ui } from '../../../lib/ui';

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
  const articleUrlNormalized = latest.article_url?.replace(/\/+$/, '');
  const articleUrlWithSlash = `${articleUrlNormalized}/`;
  const { data: detailRows } = await supabase
    .from('game_details')
    .select('*')
    .in('article_url', [latest.article_url, articleUrlNormalized, articleUrlWithSlash].filter(Boolean));

  let detail = (detailRows ?? [])[0] as ParsedGameDetail | undefined;
  const hasStructuredData = Boolean(
    detail?.about ||
      detail?.release_name ||
      detail?.release_size ||
      detail?.developer ||
      detail?.publisher ||
      detail?.release_date ||
      detail?.genre ||
      detail?.reviews ||
      detail?.system_requirements ||
      (detail?.screenshots?.length ?? 0) > 0
  );

  if (!hasStructuredData && latest.article_url) {
    try {
      const response = await fetch(latest.article_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
          Referer: 'https://game3rb.com/',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const html = await response.text();
        detail = parseGameDetail(html, latest.article_url);
      }
    } catch {
      // Fallback silently to summary if source is unreachable.
    }
  }

  return (
    <AppShell title={latest.title} subtitle={`Historique complet du jeu • ${latest.slug}`}>
      <div className="grid gap-4">
        <div className={`${ui.card} p-5`}>
          {detail?.banner_image || latest.image_url ? (
            <img
              src={detail?.banner_image ?? latest.image_url}
              alt={detail?.title ?? latest.title}
              className="mb-4 h-56 w-full rounded-xl border border-[#2a3b4f] object-cover md:h-72"
            />
          ) : null}
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
              className={ui.buttonPrimary}
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
            <div className={`${ui.card} p-5`}>
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

            <div className={`${ui.card} p-5`}>
              <h3 className="text-xl font-bold text-white">Configuration</h3>
              <pre className="mt-4 whitespace-pre-wrap text-sm text-[#c7d5e0]">
                {detail?.system_requirements ?? 'Aucune donnée'}
              </pre>
            </div>
          </section>
        )}

        {detail?.screenshots?.length > 0 && (
          <section className={`${ui.card} p-5`}>
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
          <section className={`${ui.card} p-5`}>
            <h3 className="text-xl font-bold text-white">Trailer</h3>
            <video controls className="mt-4 w-full" src={detail.trailer_url} />
          </section>
        )}

        {data.map((item) => (
          <article key={item.id} className={`${ui.card} p-5`}>
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