import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { genericConfig, parseGenericHtml } from '../../../lib/scraper';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expected) {
    return NextResponse.json(
      { ok: false, error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(genericConfig.baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `Erreur fetch: ${response.status}` },
        { status: 500 }
      );
    }

    const html = await response.text();
    const updates = parseGenericHtml(html, genericConfig);

    if (updates.length === 0) {
      return NextResponse.json({
        ok: true,
        found: 0,
        saved: false,
        message: 'Aucun jeu trouvé',
      });
    }

    const { data, error } = await supabase
      .from('game_updates')
      .upsert(updates, { onConflict: 'article_url' })
      .select();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      found: updates.length,
      saved: true,
      inserted: data?.length ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}