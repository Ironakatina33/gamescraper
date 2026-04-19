'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { cx, ui } from '../../lib/ui';

type AppShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

const navItems = [
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
    <main className={ui.page}>
      <header className={ui.topbar}>
        <div className={`${ui.container} py-4`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#66c0f4]" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#66c0f4]">
                  tracker
                </p>
                <p className="text-sm font-bold text-white">GameScraper</p>
              </div>
            </Link>

            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = isActiveLink(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx(active ? ui.navActive : ui.navInactive)}
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
        <section className={ui.section}>
          <div className={`${ui.container} py-5`}>
            {title ? <h1 className={ui.title}>{title}</h1> : null}
            {subtitle ? <p className={ui.subtitle}>{subtitle}</p> : null}
          </div>
        </section>
      )}

      <section className={ui.pageContent}>{children}</section>
    </main>
  );
}