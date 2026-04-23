import Link from 'next/link';
import BrandLogo from './components/BrandLogo';
export const metadata = {
  title: 'Accueil | GameScraper',
  description: 'Page d’accueil de GameScraper, le tracker de mises à jour de jeux.',
};
export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0f1a] text-white">
      <div className="relative min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#1e293b] to-[#0a0f1a]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-[15%] h-40 w-40 rounded-full bg-[#2563eb]/10 blur-3xl animate-pulse" />
          <div className="absolute right-[12%] top-[20%] h-56 w-56 rounded-full bg-[#1e40af]/15 blur-3xl animate-pulse" />
          <div className="absolute bottom-[15%] left-[20%] h-44 w-44 rounded-full bg-[#2563eb]/8 blur-3xl animate-pulse" />
        </div>

        <header className="relative z-10 border-b border-[#334155] bg-[#0a0f1a]/80 backdrop-blur">
          <div className="mx-auto flex max-w-[1300px] items-center justify-between px-6 py-5">
            <BrandLogo />

            <div className="hidden md:flex items-center gap-3 text-sm">
              <Link
                href="/updates"
                className="bg-[#2563eb] px-4 py-2 font-semibold text-white hover:bg-[#1d4ed8] transition rounded-md"
              >
                Entrer
              </Link>
            </div>
          </div>
        </header>

        <section className="relative z-10 mx-auto grid max-w-[1300px] gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="self-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#1e293b] px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-[#2563eb] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#2563eb] animate-pulse" />
              Game update tracker
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-white md:text-6xl xl:text-7xl">
              Suis les updates de jeux
              <span className="block text-[#2563eb]">dans une interface moderne</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#94a3b8]">
              Explore les dernières mises à jour, navigue entre les jeux, garde
              tes titres préférés dans une watchlist locale et accède rapidement
              à ce qui compte.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/updates"
                className="group bg-[#2563eb] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] rounded-md"
              >
                Voir les mises à jour
                <span className="ml-2 inline-block transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/games"
                className="bg-[#1e293b] px-6 py-3.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#334155] border border-[#334155] rounded-md"
              >
                Explorer les jeux
              </Link>

              <Link
                href="/watchlist"
                className="border border-[#334155] bg-[#1e293b]/50 px-6 py-3.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#1e293b] rounded-md"
              >
                Ouvrir ma watchlist
              </Link>
            </div>

            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="border border-[#334155] bg-[#1e293b] p-4 backdrop-blur rounded-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-[#94a3b8]">
                  Navigation
                </p>
                <p className="mt-2 text-xl font-bold text-white">Simple</p>
              </div>

              <div className="border border-[#334155] bg-[#1e293b] p-4 backdrop-blur rounded-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-[#94a3b8]">
                  Watchlist
                </p>
                <p className="mt-2 text-xl font-bold text-white">Locale</p>
              </div>

              <div className="border border-[#334155] bg-[#1e293b] p-4 backdrop-blur rounded-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-[#94a3b8]">
                  Pages jeux
                </p>
                <p className="mt-2 text-xl font-bold text-white">Détaillées</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-[560px]">
              <div className="absolute -left-8 top-8 h-36 w-36 bg-[#2563eb]/10 blur-3xl" />
              <div className="absolute -right-8 bottom-0 h-40 w-40 bg-[#1e40af]/15 blur-3xl" />

              <div className="relative border border-[#334155] bg-[#1e293b]/95 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur rounded-lg">
                <div className="border border-[#334155] bg-[#1e293b] p-4 rounded-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#2563eb]">
                        Aperçu
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-white">
                        Dernières updates
                      </h2>
                    </div>

                    <div className="bg-[#0a0f1a] px-3 py-2 text-xs text-[#94a3b8] rounded-md">
                      LIVE
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="border border-[#334155] bg-[#1e293b] p-4 transition hover:bg-[#334155]/50 rounded-lg">
                      <p className="text-xs uppercase tracking-[0.15em] text-[#94a3b8]">
                        Update récente
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Game A reçoit un patch majeur
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                        Nouveaux correctifs, équilibrage et améliorations globales.
                      </p>
                    </div>

                    <div className="border border-[#334155] bg-[#1e293b] p-4 transition hover:bg-[#334155]/50 rounded-lg">
                      <p className="text-xs uppercase tracking-[0.15em] text-[#94a3b8]">
                        Watchlist
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Tes jeux suivis restent accessibles
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                        Garde une trace locale des jeux qui t'intéressent.
                      </p>
                    </div>

                    <div className="border border-[#334155] bg-[#1e293b] p-4 transition hover:bg-[#334155]/50 rounded-lg">
                      <p className="text-xs uppercase tracking-[0.15em] text-[#94a3b8]">
                        Pages dédiées
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Une fiche claire pour chaque jeu
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                        Historique, accès source et navigation simplifiée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 hidden border border-[#334155] bg-[#1e293b]/90 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.4)] backdrop-blur md:block rounded-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-[#2563eb]">
                  Fast access
                </p>
                <p className="mt-2 text-sm text-[#e5e5e5]">
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