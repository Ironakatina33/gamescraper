'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Mot de passe incorrect');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 border border-[var(--line)] mb-6">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-lg font-medium text-[var(--ink)] tracking-tight">
            Administration
          </h1>
          <p className="mt-2 text-[13px] text-[var(--ink-muted)]">
            Connectez-vous pour accéder au panel admin
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] uppercase tracking-[0.15em] text-[var(--ink-muted)] mb-2 font-medium"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[var(--bg-elev)] border border-[var(--line)] text-[var(--ink)] placeholder-[var(--ink-muted)] text-sm focus:outline-none focus:border-[var(--brand)] transition-colors"
            />
          </div>

          {error && (
            <div className="px-4 py-3 border border-[var(--bad)]/30 bg-[var(--bad)]/5 text-[var(--bad)] text-[13px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-[var(--brand)] hover:bg-[var(--brand-hi)] text-white text-sm font-medium tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-[12px] text-[var(--ink-muted)] hover:text-[var(--brand-hi)] transition-colors"
          >
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  );
}
