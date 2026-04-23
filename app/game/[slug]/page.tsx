import { notFound } from 'next/navigation';
import AppShell from '../../components/AppShell';
import WatchlistToggleButton from '../../components/WatchlistToggleButton';
import GameViewTracker from '../../components/GameViewTracker';
import GameComments from '../../components/GameComments';
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

  const hasInfos = Boolean(
    detail?.release_name ||
      detail?.release_size ||
      detail?.developer ||
      detail?.publisher ||
      detail?.release_date ||
      detail?.genre ||
      detail?.reviews
  );

  return (
    <AppShell
      kicker={`Fiche · ${latest.slug}`}
      title={latest.title}
      subtitle={`${data.length} update${data.length > 1 ? 's' : ''} tracké${data.length > 1 ? 'es' : 'e'} depuis ${latest.source}.`}
      eyebrow={
        <div className="flex items-center gap-4 md:border-l md:border-[var(--line)] md:pl-8">
          <WatchlistToggleButton slug={latest.slug} />
        </div>
      }
    >
      <div className="space-y-16">
        {/* HERO */}
        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {detail?.banner_image || latest.image_url ? (
            <div className="relative aspect-[16/9] overflow-hidden border border-[var(--line)] bg-[var(--bg-elev)]">
              <img
                src={detail?.banner_image ?? latest.image_url}
                alt={detail?.title ?? latest.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] border border-dashed border-[var(--line-strong)] grid place-items-center">
              <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                no image
              </p>
            </div>
          )}

          <div className="space-y-5">
            <div className="flex items-center gap-4 flex-wrap">
              <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--brand-hi)] flex items-center gap-3">
                <span className="inline-block h-[1px] w-8 bg-[var(--brand)]" />
                {latest.source} · {formatDate(latest.published_at)}
              </p>
              <GameViewTracker slug={latest.slug} />
            </div>
            <h2 className="text-2xl md:text-3xl font-medium leading-tight tracking-[-0.02em]">
              {detail?.title ?? latest.title}
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--ink-dim)]">
              {detail?.about || latest.summary || 'Aucun résumé disponible.'}
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href={latest.article_url}
                target="_blank"
                rel="noreferrer"
                className={ui.buttonPrimary}
              >
                Source originale ↗
              </a>
              <WatchlistToggleButton slug={latest.slug} />
            </div>
          </div>
        </section>

        {/* INFOS + SYSREQ */}
        {(hasInfos || detail?.system_requirements) && (
          <section>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-8 flex items-center gap-3">
              <span className="inline-block h-[1px] w-8 bg-[var(--line-strong)]" />
              Fiche technique
            </p>
            <div className="grid gap-0 lg:grid-cols-2 border-t border-l border-[var(--line)]">
              {hasInfos && (
                <div className="border-r border-b border-[var(--line)] p-6">
                  <h3 className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-5">
                    Release info
                  </h3>
                  <dl className="space-y-3 text-[14px]">
                    <Info k="Nom" v={detail?.release_name} />
                    <Info k="Taille" v={detail?.release_size} />
                    <Info k="Dev" v={detail?.developer} />
                    <Info k="Éditeur" v={detail?.publisher} />
                    <Info k="Sortie" v={detail?.release_date} />
                    <Info k="Genre" v={detail?.genre} />
                    <Info k="Reviews" v={detail?.reviews} />
                  </dl>
                </div>
              )}
              {detail?.system_requirements && (
                <div className="border-r border-b border-[var(--line)] p-6">
                  <h3 className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-5">
                    Config requise
                  </h3>
                  <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--ink-dim)] mono">
                    {detail.system_requirements}
                  </pre>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SCREENSHOTS */}
        {detail?.screenshots && detail.screenshots.length > 0 && (
          <section>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-8 flex items-center gap-3">
              <span className="inline-block h-[1px] w-8 bg-[var(--line-strong)]" />
              Screenshots · {detail.screenshots.length}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {detail.screenshots.map((src: string) => (
                <img
                  key={src}
                  src={src}
                  alt={detail?.title ?? latest.title}
                  className="w-full border border-[var(--line)] object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {/* TRAILER */}
        {detail?.trailer_url && (
          <section>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-8 flex items-center gap-3">
              <span className="inline-block h-[1px] w-8 bg-[var(--line-strong)]" />
              Trailer
            </p>
            <video controls className="w-full border border-[var(--line)]" src={detail.trailer_url} />
          </section>
        )}

        {/* DOWNLOADS */}
        {detail?.download_links && detail.download_links.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] flex items-center gap-3">
                <span className="inline-block h-[1px] w-8 bg-[var(--line-strong)]" />
                Liens · {detail.download_links.length}
              </p>
            </div>
            <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--line)]">
              {detail.download_links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group border-b border-r border-[var(--line)] p-5 hover:bg-[var(--bg-elev)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--brand-hi)]">
                      {link.host || 'download'}
                    </span>
                    <span className="text-[var(--ink-muted)] group-hover:text-[var(--brand-hi)] transition-colors">
                      ↗
                    </span>
                  </div>
                  <span className="block text-[14px] text-[var(--ink)] line-clamp-2">
                    {link.text}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* HISTORY */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] flex items-center gap-3">
              <span className="inline-block h-[1px] w-8 bg-[var(--line-strong)]" />
              Historique · {data.length}
            </p>
          </div>
          <ol className="relative border-l border-[var(--line)] ml-2 space-y-0">
            {data.map((item, idx) => (
              <li key={item.id} className="relative pl-8 pb-8 last:pb-0">
                <span className="absolute left-0 top-1.5 -translate-x-1/2 h-2 w-2 rounded-full bg-[var(--brand)] ring-4 ring-[var(--bg)]" />
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted)] mb-1">
                      {idx === 0 ? 'Dernière · ' : ''}{item.source}
                    </p>
                    <h3 className="text-[17px] font-medium tracking-[-0.01em] text-[var(--ink)]">
                      {item.title}
                    </h3>
                    {item.summary ? (
                      <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-dim)] max-w-2xl">
                        {item.summary}
                      </p>
                    ) : null}
                    <a
                      href={item.article_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-[var(--brand-hi)] hover:text-[var(--ink)] border-b border-transparent hover:border-[var(--ink)] transition-colors pb-0.5"
                    >
                      Voir la source ↗
                    </a>
                  </div>
                  <p className="mono text-[11px] text-[var(--ink-muted)] shrink-0">
                    {formatDate(item.published_at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* COMMENTS */}
        <GameComments slug={latest.slug} />
      </div>
    </AppShell>
  );
}

function Info({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] pb-2 last:border-b-0">
      <dt className="mono text-[11px] uppercase tracking-[0.15em] text-[var(--ink-muted)]">
        {k}
      </dt>
      <dd className="text-[14px] text-[var(--ink-dim)] text-right truncate">
        {v || '—'}
      </dd>
    </div>
  );
}