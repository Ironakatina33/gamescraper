import Link from 'next/link';
import AppShell from './components/AppShell';

export default function NotFoundPage() {
  return (
    <AppShell title="Page introuvable" subtitle="Le contenu demandé n’existe pas">
      <div className="border border-[#263241] bg-[#182230] p-6">
        <p className="text-[#c7d5e0]">
          La page demandée n’a pas été trouvée.
        </p>

        <Link href="/" className="mt-4 inline-block bg-[#66c0f4] px-4 py-2 text-sm font-bold text-[#0b141b]">
          Retour à l’accueil
        </Link>
      </div>
    </AppShell>
  );
}