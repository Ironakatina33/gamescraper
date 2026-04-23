import UpdatesDashboard from '../components/UpdatesDashboard';
import AppShell from '../components/AppShell';
import { supabase } from '../../lib/supabase';

type GameUpdate = {
  id: string;
  title: string;
  slug: string;
  source: string;
  article_url: string;
  image_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
};

export const revalidate = 120;

export default async function UpdatesPage() {
  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(120);

  if (error) {
    return (
      <AppShell
        kicker="Dépêches"
        title="Toutes les mises à jour"
        subtitle="Impossible de charger les données pour le moment."
      >
        <div className="border border-[var(--bad)]/30 bg-[var(--bad)]/5 p-5 text-[var(--bad)] mono text-sm">
          ✕ {error.message}
        </div>
      </AppShell>
    );
  }

  const updates = (data ?? []) as GameUpdate[];
  const latest = updates[0]?.published_at
    ? new Date(updates[0].published_at).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <AppShell
      kicker="Dépêches · 01"
      title="Toutes les mises à jour"
      subtitle="Filtre, cherche, marque comme lu, ajoute à ta watchlist. Rien ne se perd."
      eyebrow={
        <div className="flex items-center gap-6 md:border-l md:border-[var(--line)] md:pl-8">
          <Metric label="Total" value={updates.length.toString().padStart(3, '0')} />
          <Metric label="Dernière" value={latest} mono={false} />
        </div>
      }
    >
      <UpdatesDashboard updates={updates} />
    </AppShell>
  );
}

function Metric({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-1.5">
        {label}
      </p>
      <p className={`${mono ? 'mono' : ''} text-lg text-[var(--ink)]`}>{value}</p>
    </div>
  );
}