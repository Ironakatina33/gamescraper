import Link from 'next/link';
import AppShell from '../components/AppShell';
import { supabase } from '../../lib/supabase';

export default async function GamesPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    return (
      <AppShell title="Jeux" subtitle="Erreur de chargement">
        <p className="text-red-400">{error.message}</p>
      </AppShell>
    );
  }

  const latestBySlug = Array.from(
    new Map((data ?? []).map((item) => [item.slug, item])).values()
  );

  return (
    <AppShell title="Jeux" subtitle="Liste des jeux détectés">
      <div className="grid gap-3">
        {latestBySlug.map((item) => (
          <Link
            key={item.slug}
            href={`/game/${item.slug}`}
            className="border border-[#263241] bg-[#182230] p-4 hover:bg-[#223041]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-1 text-sm text-[#8b98a5]">{item.slug}</p>
              </div>

              <div className="text-sm text-[#8b98a5]">
                {item.published_at
                  ? new Date(item.published_at).toLocaleString()
                  : 'Date inconnue'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}