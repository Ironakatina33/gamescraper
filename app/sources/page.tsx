import AppShell from '../components/AppShell';
import { supabase } from '../../lib/supabase';
import { ui } from '../../lib/ui';

export default async function SourcesPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('source');

  if (error) {
    return (
      <AppShell title="Sources" subtitle="Liste des sources présentes">
        <p className="text-red-400">{error.message}</p>
      </AppShell>
    );
  }

  const grouped = Object.entries(
    (data ?? []).reduce((acc: Record<string, number>, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const total = grouped.reduce((acc, [, count]) => acc + count, 0);

  return (
    <AppShell title="Sources" subtitle="Répartition des sources en base">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className={`${ui.card} p-4`}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Sources actives</p>
          <p className="mt-2 text-2xl font-black text-white">{grouped.length}</p>
        </div>
        <div className={`${ui.card} p-4`}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Entrees totales</p>
          <p className="mt-2 text-2xl font-black text-white">{total}</p>
        </div>
        <div className={`${ui.card} p-4`}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Tri</p>
          <p className="mt-2 text-2xl font-black text-[#66c0f4]">Volume desc</p>
        </div>
      </div>
      <div className="grid gap-3">
        {grouped.map(([source, count]) => (
          <div key={source} className={`${ui.card} p-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{source}</h2>
              <span className="text-sm text-[#8b98a5]">{count} entrée(s)</span>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}