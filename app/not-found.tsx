import Link from 'next/link';

// This is a server component - no 'use client' needed
// It doesn't use AppShell to avoid ThemeProvider issues during static generation
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0b1118] text-white">
      <header className="border-b border-[#1e2d3d] bg-[#111b28]">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-[#66c0f4]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M6 14h.01" />
            </svg>
            GameScraper
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mx-auto max-w-xl rounded-xl border border-[#263241] bg-[#182230] p-8 text-center">
          <h1 className="text-4xl font-black text-[#66c0f4] mb-4">404</h1>
          <h2 className="text-xl font-bold text-white mb-2">Page introuvable</h2>
          <p className="text-[#c7d5e0] mb-6">
            Le contenu demandé n'existe pas ou a été déplacé.
          </p>

          <Link 
            href="/" 
            className="inline-block rounded-lg bg-[#66c0f4] px-6 py-3 text-sm font-bold text-[#0b141b] transition hover:bg-[#8fd3ff]"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}