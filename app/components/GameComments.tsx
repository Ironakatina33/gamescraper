'use client';

import { useEffect, useState, useCallback } from 'react';

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

function timeAgo(value: string): string {
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `il y a ${days} j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default function GameComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.ok) setComments(data.comments ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [slug]);

  useEffect(() => { loadComments(); }, [loadComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, author: author.trim() || 'Anonyme', content: content.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setContent('');
        loadComments();
      } else {
        setError(data.error || 'Erreur');
      }
    } catch {
      setError('Erreur de connexion');
    }
    setSending(false);
  }

  return (
    <section>
      <p className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-muted)] mb-8 flex items-center gap-3">
        <span className="inline-block h-[1px] w-8 bg-[var(--line-strong)]" />
        Commentaires · {comments.length}
      </p>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="border border-[var(--line)] p-5 mb-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Ton pseudo (optionnel)"
            maxLength={50}
            className="border border-[var(--line)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] focus:border-[var(--brand)]"
          />
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écris un commentaire..."
            maxLength={2000}
            required
            className="border border-[var(--line)] bg-transparent px-3 py-2.5 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)] focus:border-[var(--brand)]"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="inline-flex items-center gap-2 bg-[var(--brand)] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[var(--brand-hi)] disabled:opacity-50 transition-colors"
          >
            {sending ? 'Envoi...' : 'Publier'}
          </button>
          {error && <span className="text-[12px] text-[var(--bad)]">{error}</span>}
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <p className="mono text-[11px] text-[var(--ink-muted)]">Chargement...</p>
      ) : comments.length === 0 ? (
        <div className="border border-dashed border-[var(--line-strong)] p-8 text-center">
          <p className="text-[14px] text-[var(--ink-muted)]">Aucun commentaire. Sois le premier !</p>
        </div>
      ) : (
        <div className="space-y-0 border-t border-[var(--line)]">
          {comments.map((c) => (
            <div key={c.id} className="border-b border-[var(--line)] px-5 py-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="h-6 w-6 rounded-full bg-[var(--brand)]/20 text-[var(--brand-hi)] text-[10px] font-bold grid place-items-center uppercase">
                  {c.author[0]}
                </span>
                <span className="text-[13px] font-medium text-[var(--ink)]">{c.author}</span>
                <span className="mono text-[10px] text-[var(--ink-muted)]">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-[14px] leading-relaxed text-[var(--ink-dim)] pl-9">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
