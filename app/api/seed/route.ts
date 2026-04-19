import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase.from('game_updates').insert([
    {
      title: 'Mise à jour exemple 1',
      slug: 'jeu-exemple-1',
      source: 'demo',
      article_url: 'https://example.com/update-1',
      summary: 'Ceci est une fausse mise à jour pour vérifier que le site fonctionne.',
      published_at: new Date().toISOString(),
    },
    {
      title: 'Mise à jour exemple 2',
      slug: 'jeu-exemple-2',
      source: 'demo',
      article_url: 'https://example.com/update-2',
      summary: 'Deuxième élément de test.',
      published_at: new Date().toISOString(),
    },
  ]).select();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}