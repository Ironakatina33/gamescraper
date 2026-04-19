'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type AppShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Toutes les mises à jour' },
  { href: '/games', label: 'Liste des jeux' },
  { href: '/watchlist', label: 'Ma watchlist' },
  { href: '/sources', label: 'Sources' },
];

function isActiveLink(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function AppShell({
  title,
  subtitle,
  children,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#0f141a] text-[#d6dde5]">
      <header className="border-b border-[#1d2731] bg-[#121a24]">
        <div className="mx-auto max-w-[1500px] px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-8 w-8 bg-[#66c0f4]" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#66c0f4]">
                    tracker
                  </p>
                  <p className="text-sm font-bold text-white">GameScraper</p>
                </div>
              </Link>
            </div>

            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = isActiveLink(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-sm transition ${
                      active
                        ? 'bg-[#66c0f4] text-[#0b141b] font-semibold'
                        : 'bg-[#182230] text-[#c7d5e0] hover:bg-[#223041] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {(title || subtitle) && (
        <section className="border-b border-[#1d2731] bg-[#111821]">
          <div className="mx-auto max-w-[1500px] px-5 py-5">
            {title ? <h1 className="text-2xl font-bold text-white">{title}</h1> : null}
            {subtitle ? <p className="mt-1 text-sm text-[#8b98a5]">{subtitle}</p> : null}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1500px] px-5 py-6">{children}</section>
    </main>
  );
}