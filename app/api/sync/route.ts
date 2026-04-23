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
  const adminSecret = process.env.ADMIN_SECRET || '14102004';
  const adminCookie = req.cookies.get('admin-auth')?.value;

  const isAuthed =
    authHeader === expected ||
    adminCookie === adminSecret;

  if (!isAuthed) {
    return NextResponse.json(
      { ok: false, error: 'Non autorisé' },
      { status: 401 }
    );
  }

  const supabase = getSupabaseAdminClient();
  let logId: string | null = null;

  try {
    // Create scrape log entry
    const { data: logRow } = await supabase
      .from('scrape_logs')
      .insert({ source: 'Game3Rb', status: 'running' })
      .select('id')
      .single();
    logId = logRow?.id ?? null;

    console.log('Début du scraping de:', genericConfig.baseUrl);

    const response = await fetch(genericConfig.baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        Referer: genericConfig.baseUrl,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      if (logId) await supabase.from('scrape_logs').update({ status: 'error', finished_at: new Date().toISOString(), error: `HTTP ${response.status}` }).eq('id', logId);
      console.error('Erreur HTTP:', response.status, response.statusText);
      return NextResponse.json({ ok: false, error: `Erreur HTTP: ${response.status} ${response.statusText}` }, { status: 500 });
    }

    const html = await response.text();
    console.log('HTML reçu, taille:', html.length);
    
    if (html.length < 1000) {
      console.warn('HTML suspect, trop court:', html.substring(0, 200));
    }

    const updates = parseGenericHtml(html, genericConfig);
    console.log('Updates parsées:', updates.length);

    if (updates.length === 0) {
      if (logId) await supabase.from('scrape_logs').update({ status: 'success', finished_at: new Date().toISOString(), games_found: 0 }).eq('id', logId);
      return NextResponse.json({ ok: true, found: 0, saved: false, games: [], message: 'Aucun jeu trouvé' });
    }

    // Check which are genuinely new
    const { data: existing } = await supabase
      .from('game_updates')
      .select('article_url')
      .in('article_url', updates.map(u => u.article_url));
    const existingUrls = new Set((existing ?? []).map((e: any) => e.article_url));

    const { data, error } = await supabase
      .from('game_updates')
      .upsert(updates, { onConflict: 'article_url' })
      .select();

    if (error) {
      if (logId) await supabase.from('scrape_logs').update({ status: 'error', finished_at: new Date().toISOString(), error: error.message }).eq('id', logId);
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ ok: false, error: `Erreur base de données: ${error.message}` }, { status: 500 });
    }

    const gamesNew = updates.filter(u => !existingUrls.has(u.article_url)).length;

    // Build detailed game list for admin
    const games = updates.map(u => ({
      title: u.title,
      slug: u.slug,
      image_url: u.image_url,
      article_url: u.article_url,
      published_at: u.published_at,
      is_new: !existingUrls.has(u.article_url),
    }));

    if (logId) {
      await supabase.from('scrape_logs').update({
        status: 'success',
        finished_at: new Date().toISOString(),
        games_found: updates.length,
        games_new: gamesNew,
        details: { games },
      }).eq('id', logId);
    }

    console.log('Succès: ${data?.length ?? 0} jeux insérés');
    return NextResponse.json({
      ok: true,
      source: 'Game3Rb',
      found: updates.length,
      new: gamesNew,
      saved: true,
      inserted: data?.length ?? 0,
      games,
    });
  } catch (error) {
    if (logId) await supabase.from('scrape_logs').update({ status: 'error', finished_at: new Date().toISOString(), error: error instanceof Error ? error.message : 'Erreur' }).eq('id', logId);
    console.error('Erreur complète:', error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
}