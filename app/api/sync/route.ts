import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseGenericHtml } from '../../../lib/scraper';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const html = `
      <div class="post">
        <h2><a href="https://example.com/game-a-update">Game A reçoit un patch majeur</a></h2>
        <p>Correction de bugs et amélioration des performances.</p>
        <time datetime="2026-04-19T12:00:00.000Z"></time>
      </div>
      <div class="post">
        <h2><a href="https://example.com/game-b-update">Game B ajoute un nouveau mode</a></h2>
        <p>Nouveau contenu saisonnier disponible.</p>
        <time datetime="2026-04-18T16:30:00.000Z"></time>
      </div>
    `;

    const updates = parseGenericHtml(html);

    if (updates.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0, message: 'Aucun élément trouvé' });
    }

   const { data, error } = await supabase
  .from('game_updates')
  .upsert(updates, { onConflict: 'article_url' })
  .select();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: data.length, data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Erreur inconnue' }, { status: 500 });
  }
}