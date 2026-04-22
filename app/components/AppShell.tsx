'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { cx, ui } from '../../lib/ui';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';

type AppShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

const navItems = [
  { href: '/updates', label: 'Toutes les mises à jour' },
  { href: '/games', label: 'Liste des jeux' },
  { href: '/watchlist', label: 'Ma watchlist' },
  { href: '/sources', label: 'Sources' },
];

function isActiveLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({
  title,
  subtitle,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const watchlistCount = (() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem('watchlist-games');
      const items = raw ? (JSON.parse(raw) as string[]) : [];
      return items.length;
    } catch {
      return 0;
    }
  })();

  return (
    <main className={ui.page}>
      <header className={ui.topbar}>
        <div className={`${ui.container} py-4`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo />
            </Link>

            <div className="flex items-center gap-2">
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => {
                  const active = isActiveLink(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cx(active ? ui.navActive : ui.navInactive)}
                    >
                      <span className="inline-flex items-center gap-2">
                        {item.label}
                        {item.href === '/watchlist' && watchlistCount > 0 && (
                          <span className="rounded bg-[#0b141b]/20 px-1.5 py-0.5 text-[11px] font-bold">
                            {watchlistCount}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {(title || subtitle) && (
        <section className={ui.section}>
          <div className={`${ui.container} py-6`}>
            {title ? <h1 className={ui.title}>{title}</h1> : null}
            {subtitle ? <p className={ui.subtitle}>{subtitle}</p> : null}
          </div>
        </section>
      )}

      <section className={ui.pageContent}>{children}</section>
      <Footer />
    </main>
  );
}