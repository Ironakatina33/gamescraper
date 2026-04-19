import Link from 'next/link';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function AppShell({ children, title, subtitle }: Props) {
  return (
    <main className="min-h-screen bg-[#0f141a] text-[#d6dde5]">
      <header className="border-b border-[#1d2731] bg-[#121a24]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#66c0f4]" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-[#66c0f4]">
                  tracker
                </div>
                <div className="text-sm font-bold text-white">GameScraper</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-4 md:flex">
              <Link href="/" className="text-sm text-[#d6dde5] hover:text-white">
                Accueil
              </Link>
              <Link href="/games" className="text-sm text-[#8b98a5] hover:text-white">
                Jeux
              </Link>
              <Link href="/watchlist" className="text-sm text-[#8b98a5] hover:text-white">
                Suivis
              </Link>
              <Link href="/sources" className="text-sm text-[#8b98a5] hover:text-white">
                Sources
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {(title || subtitle) && (
        <section className="border-b border-[#1d2731] bg-[#111821]">
          <div className="mx-auto max-w-[1600px] px-5 py-5">
            {title ? <h1 className="text-2xl font-bold text-white">{title}</h1> : null}
            {subtitle ? <p className="mt-1 text-sm text-[#8b98a5]">{subtitle}</p> : null}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1600px] px-5 py-6">{children}</div>
    </main>
  );
}