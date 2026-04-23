import Link from 'next/link';
import BrandLogo from './components/BrandLogo';
import { supabase } from '../lib/supabase';

export const metadata = {
  title: 'Accueil | GameScraper',
  description: 'Page d’accueil de GameScraper, le tracker de mises à jour de jeux.',
};

export const revalidate = 300;

type HomeUpdate = {
  id: string;
  title: string;
  slug: string;
  source: string;
  image_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
};

function timeAgo(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'à l\u2019instant';
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `il y a ${days} j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default async function HomePage() {
  const { data } = await supabase
    .from('game_updates')
    .select('id,title,slug,source,image_url,summary,published_at')
    .order('published_at', { ascending: false })
    .limit(12);

  const updates = (data ?? []) as HomeUpdate[];
  const hero = updates[0];
  const secondary = updates.slice(1, 4);
  const strip = updates.slice(0, 8);
  const sourcesCount = new Set(updates.map((u) => u.source)).size;
  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 600 400\'><rect width=\'600\' height=\'400\' fill=\'%230f1015\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23262732\' font-family=\'monospace\' font-size=\'32\'>no image</text></svg>';

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] h-[62px] items-center justify-between gap-6 px-5 md:px-8">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--ink-dim)]">
            <Link href="/updates" className="hover:text-[var(--ink)]">Updates</Link>
            <Link href="/games" className="hover:text-[var(--ink)]">Jeux</Link>
            <Link href="/watchlist" className="hover:text-[var(--ink)]">Watchlist</Link>
          </nav>
          <Link
            href="/updates"
            className="inline-flex items-center gap-2 bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hi)] transition-colors"
          >
            Entrer
            <span aria-hidden>→</span>
          </Link>
        </div>
      </header>

      {/* HERO — editorial masthead */}
      <section className="relative border-b border-[var(--line)] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(62,123,250,0.12),transparent_55%)]" />

        <div className="relative mx-auto max-w-[1320px] px-5 md:px-8 pt-16 pb-14 md:pt-24 md:pb-20">
          {/* Top row: issue info */}
          <div className="flex items-center justify-between mb-12 text-[11px] mono text-[var(--ink-muted)] uppercase tracking-[0.2em]">
            <span>ISSUE — {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            <span className="hidden md:inline">N°{new Date().getFullYear() - 2023}</span>
            <span className="flex items-center gap-2">
              <span className="tk-dot live-dot" />
              Scraping live
            </span>
          </div>

          {/* Headline + meta */}
          <div className="grid gap-10 md:grid-cols-[1fr_280px] md:items-end">
            <div>
              <p className="mono text-[11px] uppercase tracking-[0.22em] text-[var(--brand-hi)] mb-5 flex items-center gap-3">
                <span className="inline-block h-[1px] w-10 bg-[var(--brand)]" />
                Game update tracker
              </p>
              <h1 className="text-[clamp(2.6rem,7vw,5.5rem)] font-medium tracking-[-0.035em] leading-[0.95] text-[var(--ink)] text-balance">
                Les patchs. <br />
                Les fix. <br />
                <span className="italic font-normal text-[var(--ink-dim)]">Sans le bruit.</span>
              </h1>
            </div>

            <div className="md:pb-4 md:border-l md:border-[var(--line)] md:pl-8">
              <p className="text-[15px] leading-relaxed text-[var(--ink-dim)] text-balance">
                Un tracker qui va à l&apos;essentiel. Tu cherches un jeu,
                tu vois ses dernières updates, tu l&apos;ajoutes dans
                ta watchlist. C&apos;est tout.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/updates"
                  className="inline-flex items-center gap-2 bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--brand-hi)] transition-colors"
                >
                  Voir les updates
                  <span aria-hidden>↗</span>
                </Link>
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 border border-[var(--line-strong)] px-5 py-3 text-sm font-medium text-[var(--ink)] hover:border-[var(--ink-dim)] transition-colors"
                >
                  Les jeux
                </Link>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[var(--line)] divide-x divide-[var(--line)]">
            <Stat k="Updates" v={updates.length.toString().padStart(3, '0')} sub="récentes" />
            <Stat k="Sources" v={sourcesCount.toString().padStart(2, '0')} sub="suivies" />
            <Stat k="Refresh" v="5m" sub="auto" />
            <Stat k="Price" v="0€" sub="pour toujours" />
          </div>
        </div>
      </section>

      {/* TICKER marquee of titles */}
      {strip.length > 0 && (
        <section className="border-b border-[var(--line)] overflow-hidden py-3 bg-[var(--bg-elev)]">
          <div className="flex whitespace-nowrap marquee-track">
            {[...strip, ...strip].map((u, i) => (
              <span
                key={`${u.id}-${i}`}
                className="mono text-[12px] text-[var(--ink-muted)] px-8 uppercase tracking-[0.15em] flex items-center gap-3"
              >
                <span className="text-[var(--brand-hi)]">●</span>
                <span className="text-[var(--ink-dim)]">{u.source}</span>
                <span className="text-[var(--ink)]">{u.title}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* LATEST — editorial grid */}
      <section className="mx-auto max-w-[1320px] px-5 md:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-3">
              ↳ Section 01
            </p>
            <h2 className="text-[2rem] md:text-[2.8rem] font-medium tracking-[-0.025em] leading-[1]">
              Dernières dépêches
            </h2>
          </div>
          <Link
            href="/updates"
            className="hidden md:inline-flex items-center gap-2 text-sm text-[var(--ink-dim)] hover:text-[var(--ink)] border-b border-[var(--line-strong)] hover:border-[var(--ink)] pb-1 transition-colors"
          >
            Tout voir — {updates.length}+
            <span aria-hidden>→</span>
          </Link>
        </div>

        {hero ? (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Cover */}
            <Link
              href={`/game/${hero.slug}`}
              className="group relative block overflow-hidden border border-[var(--line)] bg-[var(--bg-card)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-elev)]">
                <img
                  src={hero.image_url || fallbackImage}
                  alt={hero.title}
                  className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent" />
                <div className="absolute top-4 left-4 mono text-[10px] uppercase tracking-[0.2em] text-white/80 bg-black/40 backdrop-blur px-2 py-1 border border-white/10">
                  Cover
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4 mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                  <span className="text-[var(--brand-hi)]">{hero.source}</span>
                  <span>—</span>
                  <span>{timeAgo(hero.published_at)}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium tracking-[-0.02em] leading-tight group-hover:text-[var(--brand-hi)] transition-colors">
                  {hero.title}
                </h3>
                {hero.summary ? (
                  <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-dim)] line-clamp-2">
                    {hero.summary}
                  </p>
                ) : null}
              </div>
            </Link>

            {/* Secondary list */}
            <div className="flex flex-col">
              {secondary.map((u, idx) => (
                <Link
                  key={u.id}
                  href={`/game/${u.slug}`}
                  className="group flex gap-4 py-5 border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--bg-elev)] transition-colors -mx-2 px-2"
                >
                  <span className="mono text-[11px] text-[var(--ink-muted)] shrink-0 pt-1">
                    0{idx + 2}
                  </span>
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-[var(--line)] bg-[var(--bg-elev)]">
                    <img
                      src={u.image_url || fallbackImage}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--brand-hi)] mb-1.5">
                      {u.source} · {timeAgo(u.published_at)}
                    </p>
                    <p className="text-[15px] font-medium leading-snug text-[var(--ink)] group-hover:text-[var(--brand-hi)] transition-colors line-clamp-2">
                      {u.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-[var(--line-strong)] p-12 text-center">
            <p className="mono text-[12px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-2">
              no data yet
            </p>
            <p className="text-[var(--ink-dim)]">
              Lance un scrape depuis le panneau admin pour voir apparaître
              les premières updates.
            </p>
          </div>
        )}
      </section>

      {/* HOW IT WORKS — editorial 3 col asymmetric */}
      <section className="border-t border-[var(--line)] bg-[var(--bg-elev)]">
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-[280px_1fr] mb-12">
            <div>
              <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-3">
                ↳ Section 02
              </p>
              <h2 className="text-[2rem] md:text-[2.6rem] font-medium tracking-[-0.025em] leading-[1]">
                Le mode d&apos;emploi.
              </h2>
            </div>
            <p className="md:pt-14 text-[17px] leading-relaxed text-[var(--ink-dim)] text-balance max-w-2xl">
              Trois étapes, zéro compte, zéro friction. Tu entres, tu regardes,
              tu pars. Et tu reviens quand t&apos;en as envie.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-3 border-t border-[var(--line)]">
            <Step n="01" title="On scrape." body="Un bot tourne en tâche de fond et récupère les dernières updates depuis les sources publiques." />
            <Step n="02" title="Tu filtres." body="Cherche par jeu, par source, marque les updates comme lues. Pagination propre, recherche instantanée." />
            <Step n="03" title="Tu suis." body="Ajoute des jeux à ta watchlist locale. Rien n'est stocké côté serveur — c'est ton navigateur." last />
          </div>
        </div>
      </section>

      {/* CTA OUTRO */}
      <section className="relative border-t border-[var(--line)] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative mx-auto max-w-[1320px] px-5 md:px-8 py-20 md:py-28">
          <div className="max-w-4xl">
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-5">
              ↳ Ouvre la porte
            </p>
            <h2 className="text-[clamp(2.2rem,5.5vw,4.2rem)] font-medium tracking-[-0.03em] leading-[0.95] text-balance">
              Prêt à <span className="italic text-[var(--ink-dim)]">arrêter</span> <br />
              de rater des patchs ?
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/updates"
                className="inline-flex items-center gap-2 bg-[var(--brand)] px-6 py-4 text-sm font-medium text-white hover:bg-[var(--brand-hi)] transition-colors"
              >
                Commencer maintenant
                <span aria-hidden>↗</span>
              </Link>
              <Link
                href="/games"
                className="inline-flex items-center gap-2 border border-[var(--line-strong)] px-6 py-4 text-sm font-medium text-[var(--ink)] hover:border-[var(--ink-dim)] transition-colors"
              >
                Catalogue des jeux
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom strip */}
      <footer className="border-t border-[var(--line)] bg-[var(--bg-elev)]">
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <p className="mono text-[11px] text-[var(--ink-muted)] uppercase tracking-[0.2em]">
            gamescraper © {new Date().getFullYear()}
          </p>
          <p className="mono text-[11px] text-[var(--ink-muted)]">
            Pas de pub · Pas de compte · Pas de tracking
          </p>
        </div>
      </footer>
    </main>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="py-6 px-5 first:pl-0 md:first:pl-5">
      <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-2">{k}</p>
      <p className="mono text-3xl md:text-4xl text-[var(--ink)] tracking-tight">{v}</p>
      <p className="mt-1 text-[12px] text-[var(--ink-dim)]">{sub}</p>
    </div>
  );
}

function Step({ n, title, body, last }: { n: string; title: string; body: string; last?: boolean }) {
  return (
    <div
      className={`p-6 md:p-8 border-[var(--line)] ${last ? '' : 'md:border-r'} border-b md:border-b-0`}
    >
      <p className="mono text-[11px] text-[var(--brand-hi)] uppercase tracking-[0.2em] mb-6">
        — {n}
      </p>
      <h3 className="text-xl md:text-2xl font-medium tracking-[-0.02em] leading-tight mb-3">
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-[var(--ink-dim)]">{body}</p>
    </div>
  );
}