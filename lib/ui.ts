export const ui = {
  page: 'min-h-screen bg-[#0a0a0a] text-[#e5e5e5]',
  topbar:
    'sticky top-0 z-30 border-b border-[#222] bg-[#0a0a0a]/90 backdrop-blur',
  section: 'border-b border-[#222] bg-[#111]',
  container: 'mx-auto max-w-[1400px] px-6',
  pageContent: 'mx-auto max-w-[1400px] px-6 py-8',

  card: 'rounded-lg border border-[#222] bg-[#111]',
  cardSoft: 'rounded-lg border border-[#222] bg-[#111]',
  rowHover: 'transition hover:bg-[#1a1a1a]',

  title: 'text-2xl font-semibold text-white md:text-3xl',
  subtitle: 'mt-2 text-sm text-[#888]',
  label: 'mb-2 block text-sm text-[#666]',
  sectionTitle:
    'mb-4 text-xs font-semibold uppercase tracking-wider text-[#3b82f6]',

  input:
    'w-full rounded-md border border-[#333] bg-[#111] px-3 py-2 text-sm text-white outline-none placeholder:text-[#666] focus:border-[#3b82f6]',
  select:
    'w-full rounded-md border border-[#333] bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]',

  buttonPrimary:
    'rounded-md bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563eb]',
  buttonSecondary:
    'rounded-md bg-[#222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#333]',
  buttonWatchAdd:
    'rounded-md bg-[#222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#333]',
  buttonWatchRemove:
    'rounded-md bg-[#222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#333]',

  navActive:
    'rounded-md bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white',
  navInactive:
    'rounded-md bg-transparent px-4 py-2 text-sm text-[#888] transition hover:bg-[#111] hover:text-white',
  heroBadge:
    'inline-flex items-center gap-2 rounded-full border border-[#333] bg-[#111] px-3 py-1.5 text-xs uppercase tracking-wider text-[#3b82f6]',
};

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}