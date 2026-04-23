import Link from 'next/link';
import AppShell from '../components/AppShell';
import { supabase } from '../../lib/supabase';
import { ui } from '../../lib/ui';

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
    <AppShell title="Jeux" subtitle="Catalogue deduit des dernieres mises a jour">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className={`${ui.card} p-4`}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Jeux uniques</p>
          <p className="mt-2 text-2xl font-black text-white">{latestBySlug.length}</p>
        </div>
        <div className={`${ui.card} p-4`}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Entrees source</p>
          <p className="mt-2 text-2xl font-black text-white">{(data ?? []).length}</p>
        </div>
        <div className={`${ui.card} p-4`}>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">Navigation</p>
          <p className="mt-2 text-2xl font-black text-[#2563eb]">/game/[slug]</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {latestBySlug.map((item) => (
          <Link
            key={item.slug}
            href={`/game/${item.slug}`}
            className={`${ui.card} p-4 transition hover:-translate-y-0.5 hover:bg-[#334155]/50`}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="mb-4 h-44 w-full rounded-xl border border-[#334155] object-cover"
              />
            ) : null}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-1 text-sm text-[#8b98a5]">{item.slug}</p>
              </div>

              <div className="text-sm text-[#8b98a5]">
                {item.published_at ? new Date(item.published_at).toLocaleString('fr-FR') : 'Date inconnue'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}