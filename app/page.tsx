import Link from 'next/link';
import BrandLogo from './components/BrandLogo';
export const metadata = {
  title: 'Accueil | GameScraper',
  description: 'Page d’accueil de GameScraper, le tracker de mises à jour de jeux.',
};
export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b1118] text-white">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(102,192,244,0.2),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(42,71,94,0.3),transparent_28%),linear-gradient(180deg,#0f141a_0%,#0c1218_45%,#0a0f14_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-[8%] top-[15%] h-40 w-40 rounded-full bg-[#66c0f4]/20 blur-3xl animate-pulse" />
          <div className="absolute right-[12%] top-[20%] h-56 w-56 rounded-full bg-[#2a475e]/30 blur-3xl animate-pulse" />
          <div className="absolute bottom-[15%] left-[20%] h-44 w-44 rounded-full bg-[#66c0f4]/10 blur-3xl animate-pulse" />
        </div>

        <header className="relative z-10 border-b border-white/5 bg-[#10161d]/80 backdrop-blur">
          <div className="mx-auto flex max-w-[1300px] items-center justify-between px-6 py-5">
            <BrandLogo />

            <div className="hidden md:flex items-center gap-3 text-sm">
              <Link
                href="/updates"
                className="bg-[#66c0f4] px-4 py-2 font-semibold text-[#0b141b] hover:bg-[#8fd3ff] transition"
              >
                Entrer
              </Link>
            </div>
          </div>
        </header>

        <section className="relative z-10 mx-auto grid max-w-[1300px] gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="self-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2c455d] bg-[#132131] px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-[#7fd0ff] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#66c0f4] animate-pulse" />
              Game update tracker
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-white md:text-6xl xl:text-7xl">
              Suis les updates de jeux
              <span className="block text-[#66c0f4]">dans une interface claire</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#9eacb8]">
              Explore les dernières mises à jour, navigue entre les jeux, garde
              tes titres préférés dans une watchlist locale et accède rapidement
              à ce qui compte.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/updates"
                className="group bg-[#66c0f4] px-6 py-3.5 text-sm font-bold text-[#0b141b] shadow-[0_12px_30px_rgba(102,192,244,0.25)] transition hover:-translate-y-0.5 hover:bg-[#8fd3ff]"
              >
                Voir les mises à jour
                <span className="ml-2 inline-block transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/games"
                className="bg-[#223041] px-6 py-3.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#2d4055]"
              >
                Explorer les jeux
              </Link>

              <Link
                href="/watchlist"
                className="border border-white/10 bg-white/5 px-6 py-3.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Ouvrir ma watchlist
              </Link>
            </div>

            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">
                  Navigation
                </p>
                <p className="mt-2 text-xl font-bold text-white">Simple</p>
              </div>

              <div className="border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">
                  Watchlist
                </p>
                <p className="mt-2 text-xl font-bold text-white">Locale</p>
              </div>

              <div className="border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">
                  Pages jeux
                </p>
                <p className="mt-2 text-xl font-bold text-white">Détaillées</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-[560px]">
              <div className="absolute -left-8 top-8 h-36 w-36 bg-[#66c0f4]/20 blur-3xl" />
              <div className="absolute -right-8 bottom-0 h-40 w-40 bg-[#2a475e]/35 blur-3xl" />

              <div className="relative border border-white/10 bg-[#111821]/95 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur">
                <div className="border border-[#263241] bg-[#182230] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#66c0f4]">
                        Aperçu
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-white">
                        Dernières updates
                      </h2>
                    </div>

                    <div className="bg-[#0f151c] px-3 py-2 text-xs text-[#8b98a5]">
                      LIVE
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="border border-[#263241] bg-[#111821] p-4 transition hover:bg-[#15202b]">
                      <p className="text-xs uppercase tracking-[0.15em] text-[#8b98a5]">
                        Update récente
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Game A reçoit un patch majeur
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#9eacb8]">
                        Nouveaux correctifs, équilibrage et améliorations globales.
                      </p>
                    </div>

                    <div className="border border-[#263241] bg-[#111821] p-4 transition hover:bg-[#15202b]">
                      <p className="text-xs uppercase tracking-[0.15em] text-[#8b98a5]">
                        Watchlist
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Tes jeux suivis restent accessibles
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#9eacb8]">
                        Garde une trace locale des jeux qui t’intéressent.
                      </p>
                    </div>

                    <div className="border border-[#263241] bg-[#111821] p-4 transition hover:bg-[#15202b]">
                      <p className="text-xs uppercase tracking-[0.15em] text-[#8b98a5]">
                        Pages dédiées
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Une fiche claire pour chaque jeu
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#9eacb8]">
                        Historique, accès source et navigation simplifiée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 hidden border border-white/10 bg-[#10161d]/90 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.4)] backdrop-blur md:block">
                <p className="text-xs uppercase tracking-[0.2em] text-[#66c0f4]">
                  Fast access
                </p>
                <p className="mt-2 text-sm text-[#c7d5e0]">
                  Clique, cherche, suis.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}