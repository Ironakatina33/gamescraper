import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-[#f5f5f7]">
      <header className="sticky top-0 z-40 border-b border-[#1a1b23] bg-[#050507]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] h-[62px] items-center justify-between gap-6 px-5 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="relative inline-block h-6 w-6">
              <span className="absolute inset-0 bg-[#3e7bfa]" />
              <span className="absolute inset-[3px] bg-[#050507]" />
              <span className="absolute inset-[7px] bg-[#5b9eff]" />
            </span>
            <span className="text-[15px] font-medium tracking-tight">gamescraper</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#3e7bfa] px-4 py-2 text-sm font-medium text-white hover:bg-[#5b9eff] transition-colors"
          >
            Accueil
            <span aria-hidden>→</span>
          </Link>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative mx-auto max-w-[1320px] px-5 md:px-8 py-24 md:py-40 text-center">
          <p
            className="mono text-[11px] uppercase tracking-[0.2em] text-[#5b9eff] mb-6"
            style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
          >
            — Erreur 404
          </p>
          <h1 className="text-[clamp(4rem,12vw,10rem)] font-medium tracking-[-0.04em] leading-[0.85] text-[#f5f5f7]">
            404
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-[#a7a8b3] max-w-md mx-auto">
            Cette page n&apos;existe pas ou a été déplacée.
            Peut-être une update qu&apos;on n&apos;a pas encore scrapée.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#3e7bfa] px-6 py-4 text-sm font-medium text-white hover:bg-[#5b9eff] transition-colors"
            >
              Retour à l&apos;accueil
              <span aria-hidden>↗</span>
            </Link>
            <Link
              href="/updates"
              className="inline-flex items-center gap-2 border border-[#262732] px-6 py-4 text-sm font-medium text-[#f5f5f7] hover:border-[#6a6b78] transition-colors"
            >
              Voir les updates
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1a1b23]">
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6 flex items-center justify-between">
          <p
            className="mono text-[11px] text-[#6a6b78] uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
          >
            gamescraper {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}