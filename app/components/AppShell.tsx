'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { cx, ui } from '../../lib/ui';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';

type AppShellProps = {
  title?: string;
  subtitle?: string;
  kicker?: string;
  eyebrow?: ReactNode;
  children: ReactNode;
};

const navItems = [
  { href: '/updates', label: 'Updates', short: '01' },
  { href: '/games', label: 'Jeux', short: '02' },
  { href: '/watchlist', label: 'Watchlist', short: '03' },
];

function isActiveLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({
  title,
  subtitle,
  kicker,
  eyebrow,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [clockStr, setClockStr] = useState('');

  useEffect(() => {
    const readCount = () => {
      try {
        const raw = localStorage.getItem('watchlist-games');
        const items = raw ? (JSON.parse(raw) as string[]) : [];
        setWatchlistCount(items.length);
      } catch {
        setWatchlistCount(0);
      }
    };
    readCount();
    const onStorage = () => readCount();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', readCount);
    const id = window.setInterval(readCount, 1500);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', readCount);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      setClockStr(`${hh}:${mm} CET`);
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className={ui.page}>
      <header className={ui.topbar}>
        <div className={`${ui.container} flex h-[62px] items-center justify-between gap-6`}>
          <Link href="/" className="inline-flex items-center shrink-0">
            <BrandLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActiveLink(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(active ? ui.navActive : ui.navInactive, 'relative')}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="mono text-[10px] text-[var(--ink-muted)]">
                      {item.short}
                    </span>
                    {item.label}
                    {item.href === '/watchlist' && watchlistCount > 0 && (
                      <span className="mono text-[10px] text-[var(--brand-hi)]">
                        {watchlistCount.toString().padStart(2, '0')}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline mono text-[11px] text-[var(--ink-muted)]">
              {clockStr}
            </span>
            <span className="hidden lg:inline-flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
              <span className="tk-dot live-dot" />
              <span className="mono uppercase tracking-[0.2em]">Live</span>
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-[var(--line)]">
          <div className={`${ui.container} flex overflow-x-auto gap-1 py-2`}>
            {navItems.map((item) => {
              const active = isActiveLink(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    'px-3 py-1.5 text-sm whitespace-nowrap',
                    active ? 'text-[var(--ink)] border-b border-[var(--brand)]' : 'text-[var(--ink-dim)]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {(title || subtitle || kicker || eyebrow) && (
        <section className="border-b border-[var(--line)]">
          <div className={`${ui.container} grid gap-8 pt-12 pb-10 md:grid-cols-[1fr_auto] md:items-end`}>
            <div>
              {kicker ? (
                <p className={`${ui.kicker} mb-4 flex items-center gap-3`}>
                  <span className="inline-block h-[1px] w-8 bg-[var(--brand)]" />
                  {kicker}
                </p>
              ) : null}
              {title ? <h1 className={`${ui.title} text-balance`}>{title}</h1> : null}
              {subtitle ? <p className={ui.subtitle}>{subtitle}</p> : null}
            </div>
            {eyebrow ? <div className="shrink-0">{eyebrow}</div> : null}
          </div>
        </section>
      )}

      <section className={ui.pageContent}>{children}</section>
      <Footer />
    </main>
  );
}