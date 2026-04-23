'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--bg-elev)]">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              About
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-dim)] max-w-sm">
              Un petit tracker perso pour suivre les updates de jeux sans te
              noyer dans du bruit. Pas de pub, pas de compte, juste les infos.
            </p>
          </div>
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              Explorer
            </p>
            <ul className="mt-4 space-y-2 text-[14px]">
              <li><Link href="/updates" className="text-[var(--ink-dim)] hover:text-[var(--ink)]">Updates</Link></li>
              <li><Link href="/games" className="text-[var(--ink-dim)] hover:text-[var(--ink)]">Jeux</Link></li>
              <li><Link href="/watchlist" className="text-[var(--ink-dim)] hover:text-[var(--ink)]">Watchlist</Link></li>
            </ul>
          </div>
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              Système
            </p>
            <ul className="mt-4 space-y-2 text-[14px]">
              <li><Link href="/admin" className="text-[var(--ink-dim)] hover:text-[var(--ink)]">Admin</Link></li>
              <li>
                <a
                  href="https://game3rb.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--ink-dim)] hover:text-[var(--ink)]"
                >
                  Source ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              Status
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="tk-dot live-dot" />
              <span className="text-[14px] text-[var(--ink-dim)]">Opérationnel</span>
            </div>
            <p className="mt-3 mono text-[11px] text-[var(--ink-muted)]">
              Auto-refresh / 5 min
            </p>
          </div>
        </div>

        <div className="mt-12 hr-soft" />

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-[11px] text-[var(--ink-muted)]">
            © {year} — gamescraper. Built with no-bullshit.
          </p>
          <p className="mono text-[11px] text-[var(--ink-muted)]">
            <span className="text-[var(--ink-dim)]">{'>'}</span>_ stay patched.
          </p>
        </div>
      </div>
    </footer>
  );
}
