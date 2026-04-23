'use client';

import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-[60px] items-center border border-[var(--line-strong)] bg-[var(--bg-elev)] px-0.5 transition-colors hover:border-[var(--ink-muted)]"
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      <span className="absolute left-2 top-1/2 -translate-y-1/2 mono text-[9px] uppercase tracking-wider text-[var(--ink-muted)]">
        {isDark ? 'D' : ''}
      </span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 mono text-[9px] uppercase tracking-wider text-[var(--ink-muted)]">
        {!isDark ? 'L' : ''}
      </span>
      <span
        className={`inline-block h-[26px] w-[26px] bg-[var(--brand)] transition-transform duration-300 ${
          isDark ? 'translate-x-0' : 'translate-x-[28px]'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mt-1.5"
        >
          {isDark ? (
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </>
          )}
        </svg>
      </span>
    </button>
  );
}
