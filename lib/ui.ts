export const ui = {
  page: 'min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-[#e5e5e5]',
  topbar:
    'sticky top-0 z-30 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-lg',
  section: 'border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-blue-800/30 backdrop-blur-sm',
  container: 'mx-auto max-w-[1400px] px-6',
  pageContent: 'mx-auto max-w-[1400px] px-6 py-8',

  card: 'rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300',
  cardSoft: 'rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm',
  rowHover: 'transition-all duration-300 hover:bg-white/5 hover:backdrop-blur-sm',

  title: 'text-2xl font-semibold text-white md:text-3xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent',
  subtitle: 'mt-2 text-sm text-blue-200/70',
  label: 'mb-2 block text-sm text-blue-200/80 font-medium',
  sectionTitle:
    'mb-4 text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent',

  input:
    'w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white outline-none placeholder:text-blue-200/50 focus:border-blue-400/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300',
  select:
    'w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white outline-none focus:border-blue-400/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300',

  buttonPrimary:
    'rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:-translate-y-0.5',
  buttonSecondary:
    'rounded-xl bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5',
  buttonWatchAdd:
    'rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm px-6 py-3 text-sm font-medium text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300',
  buttonWatchRemove:
    'rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm px-6 py-3 text-sm font-medium text-red-300 border border-red-400/30 hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-300',

  navActive:
    'rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg',
  navInactive:
    'rounded-xl bg-transparent px-4 py-2 text-sm text-blue-200/70 transition-all duration-300 hover:bg-white/10 hover:text-white',
  heroBadge:
    'inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-2 text-xs uppercase tracking-wider text-blue-300 backdrop-blur-sm',
};

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}