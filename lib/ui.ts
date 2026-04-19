export const ui = {
  page: 'min-h-screen bg-[#0f141a] text-[#d6dde5]',
  topbar: 'border-b border-[#1d2731] bg-[#121a24]',
  section: 'border-b border-[#1d2731] bg-[#111821]',
  container: 'mx-auto max-w-[1500px] px-5',
  pageContent: 'mx-auto max-w-[1500px] px-5 py-6',

  card: 'border border-[#263241] bg-[#182230]',
  cardSoft: 'border border-[#1d2731] bg-[#111821]',
  rowHover: 'hover:bg-[#121a24]',

  title: 'text-2xl font-bold text-white',
  subtitle: 'mt-1 text-sm text-[#8b98a5]',
  label: 'mb-2 block text-sm text-[#8b98a5]',
  sectionTitle:
    'mb-4 text-sm font-bold uppercase tracking-[0.15em] text-[#66c0f4]',

  input:
    'w-full border border-[#314355] bg-[#182230] px-3 py-2 text-sm text-white outline-none placeholder:text-[#73808c]',
  select:
    'w-full border border-[#314355] bg-[#182230] px-3 py-2 text-sm text-white outline-none',

  buttonPrimary:
    'bg-[#66c0f4] px-3 py-2 text-center text-sm font-semibold text-[#0b141b] hover:bg-[#8fd3ff]',
  buttonSecondary:
    'bg-[#223041] px-3 py-2 text-center text-sm text-white hover:bg-[#2d4055]',
  buttonWatchAdd:
    'bg-[#2a475e] px-3 py-2 text-sm font-medium text-white hover:bg-[#3b6687]',
  buttonWatchRemove:
    'bg-[#1f4e2f] px-3 py-2 text-sm font-medium text-[#baffc4] hover:bg-[#28653d]',

  navActive:
    'bg-[#66c0f4] px-3 py-2 text-sm font-semibold text-[#0b141b]',
  navInactive:
    'bg-[#182230] px-3 py-2 text-sm text-[#c7d5e0] hover:bg-[#223041] hover:text-white',
};

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}