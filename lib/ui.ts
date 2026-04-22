export const ui = {
  page: 'min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(102,192,244,0.16),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(57,130,189,0.14),transparent_32%),linear-gradient(180deg,#0b1118_0%,#0b121a_52%,#0a1017_100%)] text-[#d6dde5]',
  topbar:
    'sticky top-0 z-30 border-b border-[#243546] bg-[#0f1722]/85 backdrop-blur supports-[backdrop-filter]:bg-[#0f1722]/70',
  section: 'border-b border-[#1d2b3a] bg-[#0f1722]/70',
  container: 'mx-auto max-w-[1500px] px-5',
  pageContent: 'mx-auto max-w-[1500px] px-5 py-6',

  card: 'rounded-2xl border border-[#27384a] bg-[#172232]/95 shadow-[0_10px_35px_rgba(0,0,0,0.25)]',
  cardSoft: 'rounded-xl border border-[#1e2d3d] bg-[#111b28]/95',
  rowHover: 'transition hover:bg-[#162334]',

  title: 'text-2xl font-black tracking-tight text-white md:text-3xl',
  subtitle: 'mt-1 text-sm text-[#9cb0c2]',
  label: 'mb-2 block text-sm text-[#8b98a5]',
  sectionTitle:
    'mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#66c0f4]',

  input:
    'w-full rounded-lg border border-[#32465b] bg-[#182536] px-3 py-2 text-sm text-white outline-none placeholder:text-[#73808c] focus:border-[#66c0f4]',
  select:
    'w-full rounded-lg border border-[#314355] bg-[#182536] px-3 py-2 text-sm text-white outline-none focus:border-[#66c0f4]',

  buttonPrimary:
    'rounded-lg bg-[#66c0f4] px-3 py-2 text-center text-sm font-semibold text-[#0b141b] transition hover:bg-[#8fd3ff]',
  buttonSecondary:
    'rounded-lg bg-[#24364a] px-3 py-2 text-center text-sm text-white transition hover:bg-[#2d455d]',
  buttonWatchAdd:
    'rounded-lg bg-[#2a475e] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#3b6687]',
  buttonWatchRemove:
    'rounded-lg bg-[#1f4e2f] px-3 py-2 text-sm font-medium text-[#baffc4] transition hover:bg-[#28653d]',

  navActive:
    'rounded-lg bg-[#66c0f4] px-3 py-2 text-sm font-semibold text-[#0b141b] shadow-[0_8px_20px_rgba(102,192,244,0.28)]',
  navInactive:
    'rounded-lg bg-[#1a2838] px-3 py-2 text-sm text-[#c7d5e0] transition hover:bg-[#22364a] hover:text-white',
  heroBadge:
    'inline-flex items-center gap-2 rounded-full border border-[#2c455d] bg-[#132131] px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-[#7fcfff]',
};

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}