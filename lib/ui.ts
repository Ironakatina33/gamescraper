export const ui = {
  page: 'min-h-screen bg-[var(--bg)] text-[var(--ink)]',
  topbar:
    'sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-xl',
  section: 'border-b border-[var(--line)] bg-[var(--bg-elev)]',
  container: 'mx-auto max-w-[1320px] px-5 md:px-8',
  pageContent: 'mx-auto max-w-[1320px] px-5 md:px-8 py-10',

  card: 'border border-[var(--line)] bg-[var(--bg-card)]',
  cardSoft: 'border border-[var(--line)] bg-[var(--bg-elev)]',
  rowHover: 'transition-colors duration-200 hover:bg-[var(--bg-elev)]',

  title: 'text-[2rem] md:text-[2.6rem] font-medium tracking-[-0.02em] leading-[1.05] text-[var(--ink)]',
  subtitle: 'mt-3 text-[15px] leading-relaxed text-[var(--ink-dim)] max-w-prose',
  label: 'mb-2 block text-[11px] uppercase tracking-[0.15em] text-[var(--ink-muted)] font-medium',
  sectionTitle:
    'text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ink-muted)]',

  input:
    'w-full border border-[var(--line)] bg-[var(--bg-elev)] px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] focus:border-[var(--brand)] transition-colors',
  select:
    'w-full border border-[var(--line)] bg-[var(--bg-elev)] px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] transition-colors appearance-none',

  buttonPrimary:
    'inline-flex items-center justify-center gap-2 bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--brand-hi)] transition-colors',
  buttonSecondary:
    'inline-flex items-center justify-center gap-2 bg-transparent px-5 py-3 text-sm font-medium text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--ink-dim)] hover:bg-[var(--bg-elev)] transition-colors',
  buttonGhost:
    'inline-flex items-center justify-center gap-2 bg-transparent px-3 py-2 text-sm font-medium text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors',
  buttonWatchAdd:
    'inline-flex items-center justify-center gap-2 bg-transparent px-5 py-3 text-sm font-medium text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--brand)] hover:text-[var(--brand-hi)] transition-colors',
  buttonWatchRemove:
    'inline-flex items-center justify-center gap-2 bg-transparent px-5 py-3 text-sm font-medium text-[var(--bad)] border border-[var(--bad)]/30 hover:bg-[var(--bad)]/10 transition-colors',

  navActive:
    'relative px-4 py-2 text-sm font-medium text-[var(--ink)] after:absolute after:left-4 after:right-4 after:-bottom-[17px] after:h-[1px] after:bg-[var(--brand)]',
  navInactive:
    'px-4 py-2 text-sm text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors',
  heroBadge:
    'inline-flex items-center gap-2 border border-[var(--line-strong)] bg-[var(--bg-elev)] px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[var(--ink-dim)]',

  kicker:
    'text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--brand-hi)]',
  meta: 'text-[12px] text-[var(--ink-muted)] mono',
};

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}