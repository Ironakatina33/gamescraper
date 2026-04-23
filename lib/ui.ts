export const ui = {
  page: 'min-h-screen bg-[#0a0f1a] text-[#e5e5e5]',
  topbar:
    'sticky top-0 z-30 border-b border-[#334155] bg-[#0a0f1a]/90 backdrop-blur',
  section: 'border-b border-[#334155] bg-[#1e293b]',
  container: 'mx-auto max-w-[1400px] px-6',
  pageContent: 'mx-auto max-w-[1400px] px-6 py-8',

  card: 'rounded-lg border border-[#334155] bg-[#1e293b] shadow-sm',
  cardSoft: 'rounded-lg border border-[#334155] bg-[#1e293b]/50',
  rowHover: 'transition hover:bg-[#334155]/50',

  title: 'text-2xl font-semibold text-white md:text-3xl',
  subtitle: 'mt-2 text-sm text-[#94a3b8]',
  label: 'mb-2 block text-sm text-[#94a3b8]',
  sectionTitle:
    'mb-4 text-xs font-semibold uppercase tracking-wider text-[#2563eb]',

  input:
    'w-full rounded-md border border-[#334155] bg-[#1e293b] px-3 py-2 text-sm text-white outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]',
  select:
    'w-full rounded-md border border-[#334155] bg-[#1e293b] px-3 py-2 text-sm text-white outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]',

  buttonPrimary:
    'rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d4ed8] focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 focus:ring-offset-[#0a0f1a]',
  buttonSecondary:
    'rounded-md bg-[#1e293b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#334155] border border-[#334155]',
  buttonWatchAdd:
    'rounded-md bg-[#1e293b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563eb] border border-[#334155]',
  buttonWatchRemove:
    'rounded-md bg-[#dc2626] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b91c1c] border border-[#dc2626]',

  navActive:
    'rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white',
  navInactive:
    'rounded-md bg-transparent px-4 py-2 text-sm text-[#94a3b8] transition hover:bg-[#1e293b] hover:text-white',
  heroBadge:
    'inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#1e293b] px-3 py-1.5 text-xs uppercase tracking-wider text-[#2563eb]',
};

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}