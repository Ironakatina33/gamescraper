import { notFound } from 'next/navigation';
import AppShell from '../../components/AppShell';
import { supabase } from '../../../lib/supabase';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function GamePage({ params }: Props) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .eq('slug', slug)
    .order('published_at', { ascending: false });

  if (error || !data || data.length === 0) {
    notFound();
  }

  const latest = data[0];

  return (
    <AppShell title={latest.title} subtitle={`Historique complet du jeu • ${latest.slug}`}>
      <div className="grid gap-4">
        <div className="border border-[#263241] bg-[#182230] p-5">
          <p className="text-sm text-[#8b98a5]">Dernière mise à jour</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{latest.title}</h2>
          <p className="mt-3 text-[#c7d5e0]">{latest.summary || 'Aucun résumé disponible.'}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={latest.article_url}
              target="_blank"
              rel="noreferrer"
              className="bg-[#66c0f4] px-4 py-2 text-sm font-bold text-[#0b141b]"
            >
              Voir la source originale
            </a>
          </div>
        </div>

        {data.map((item) => (
          <article key={item.id} className="border border-[#263241] bg-[#182230] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b98a5]">
                  {item.source}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#c7d5e0]">
                  {item.summary || 'Aucun résumé disponible.'}
                </p>

                <a
                  href={item.article_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-[#66c0f4]"
                >
                  Ouvrir la source →
                </a>
              </div>

              <div className="text-sm text-[#8b98a5]">
                {item.published_at
                  ? new Date(item.published_at).toLocaleString()
                  : 'Date inconnue'}
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}