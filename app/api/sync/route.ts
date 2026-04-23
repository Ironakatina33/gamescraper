import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { genericConfig, parseGenericHtml } from '../../../lib/scraper';

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Variables d environnement manquantes: NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET || '14102004'}`;

  if (authHeader !== expected) {
    return NextResponse.json(
      { ok: false, error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseAdminClient();

    console.log('Début du scraping de:', genericConfig.baseUrl);

    const response = await fetch(genericConfig.baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        Referer: genericConfig.baseUrl,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      console.error('Erreur HTTP:', response.status, response.statusText);
      return NextResponse.json(
        { ok: false, error: `Erreur HTTP: ${response.status} ${response.statusText}` },
        { status: 500 }
      );
    }

    const html = await response.text();
    console.log('HTML reçu, taille:', html.length);
    
    if (html.length < 1000) {
      console.warn('HTML suspect, trop court:', html.substring(0, 200));
    }

    const updates = parseGenericHtml(html, genericConfig);
    console.log('Updates parsées:', updates.length);

    if (updates.length === 0) {
      return NextResponse.json({
        ok: true,
        found: 0,
        saved: false,
        message: 'Aucun jeu trouvé - le site a peut-être changé sa structure',
      });
    }

    const { data, error } = await supabase
      .from('game_updates')
      .upsert(updates, { onConflict: 'article_url' })
      .select();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { ok: false, error: `Erreur base de données: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Succès: ${data?.length ?? 0} jeux insérés');
    return NextResponse.json({
      ok: true,
      found: updates.length,
      saved: true,
      inserted: data?.length ?? 0,
    });
  } catch (error) {
    console.error('Erreur complète:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}