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
  { href: '/watchlist', label: 'Collection', short: '03' },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

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

  // Lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex flex-col gap-1 items-center justify-center h-8 w-8 border border-[var(--line-strong)] bg-[var(--bg-elev)]"
              aria-label="Menu"
            >
              <span className={cx('h-[1.5px] w-3.5 bg-[var(--ink)] transition-all duration-200', mobileOpen && 'rotate-45 translate-y-[3.5px]')} />
              <span className={cx('h-[1.5px] w-3.5 bg-[var(--ink)] transition-all duration-200', mobileOpen && 'opacity-0')} />
              <span className={cx('h-[1.5px] w-3.5 bg-[var(--ink)] transition-all duration-200', mobileOpen && '-rotate-45 -translate-y-[3.5px]')} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="absolute top-0 right-0 w-72 h-full bg-[var(--bg)] border-l border-[var(--line)] flex flex-col animate-in">
            <div className="flex items-center justify-between h-[62px] px-5 border-b border-[var(--line)]">
              <span className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Navigation
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-[var(--ink-dim)] hover:text-[var(--ink)] text-lg"
              >
                ×
              </button>
            </div>
            <div className="flex-1 py-4">
              {navItems.map((item) => {
                const active = isActiveLink(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cx(
                      'flex items-center gap-4 px-5 py-4 text-[15px] transition-colors border-b border-[var(--line)]',
                      active ? 'text-[var(--ink)] bg-[var(--bg-elev)]' : 'text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--bg-elev)]'
                    )}
                  >
                    <span className="mono text-[10px] text-[var(--ink-muted)]">{item.short}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.href === '/watchlist' && watchlistCount > 0 && (
                      <span className="mono text-[10px] text-[var(--brand-hi)]">
                        {watchlistCount.toString().padStart(2, '0')}
                      </span>
                    )}
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />}
                  </Link>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-[var(--line)] space-y-3">
              <div className="flex items-center gap-2">
                <span className="tk-dot live-dot" />
                <span className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  {clockStr || 'Live'}
                </span>
              </div>
            </div>
          </nav>
        </div>
      )}

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