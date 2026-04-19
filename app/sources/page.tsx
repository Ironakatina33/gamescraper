import AppShell from '../components/AppShell';
import { supabase } from '../../lib/supabase';

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

  return (
    <AppShell title="Sources" subtitle="Répartition des sources en base">
      <div className="grid gap-3">
        {grouped.map(([source, count]) => (
          <div key={source} className="border border-[#263241] bg-[#182230] p-4">
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