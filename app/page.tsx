import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0f141a] text-[#d6dde5]">
      <header className="border-b border-[#1d2731] bg-[#121a24]">
        <div className="mx-auto max-w-[1200px] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#66c0f4]" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#66c0f4]">
                tracker
              </p>
              <p className="text-sm font-bold text-white">GameScraper</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[#66c0f4]">
            Accueil
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
            Suivre les mises à jour de jeux, simplement.
          </h1>

          <p className="mt-6 text-lg leading-8 text-[#8b98a5]">
            Consulte les dernières mises à jour enregistrées, explore les jeux,
            garde une watchlist locale et navigue dans une interface plus simple.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/updates"
              className="bg-[#66c0f4] px-5 py-3 text-sm font-semibold text-[#0b141b] hover:bg-[#8fd3ff]"
            >
              Voir les mises à jour
            </Link>

            <Link
              href="/games"
              className="bg-[#223041] px-5 py-3 text-sm text-white hover:bg-[#2d4055]"
            >
              Voir la liste des jeux
            </Link>

            <Link
              href="/watchlist"
              className="bg-[#223041] px-5 py-3 text-sm text-white hover:bg-[#2d4055]"
            >
              Ouvrir ma watchlist
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}