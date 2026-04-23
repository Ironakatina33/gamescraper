import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { iggConfig, parseIggHtml } from '../../../lib/scraper';

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

const PAGES_TO_SCRAPE = 3;
const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: iggConfig.baseUrl,
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
};

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      console.error(`IGG fetch error ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.error(`IGG fetch failed for ${url}:`, err);
    return null;
  }
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

  try {
    const supabase = getSupabaseAdminClient();
    const allUpdates: ReturnType<typeof parseIggHtml> = [];

    // Scrape multiple pages
    for (let page = 1; page <= PAGES_TO_SCRAPE; page++) {
      const url = page === 1 ? iggConfig.baseUrl : `${iggConfig.baseUrl}page/${page}`;
      console.log(`[IGG] Scraping page ${page}: ${url}`);

      const html = await fetchPage(url);
      if (!html) continue;

      const updates = parseIggHtml(html);
      console.log(`[IGG] Page ${page}: ${updates.length} jeux trouvés`);
      allUpdates.push(...updates);

      // Small delay between pages to be polite
      if (page < PAGES_TO_SCRAPE) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Deduplicate by article_url
    const seen = new Set<string>();
    const unique = allUpdates.filter((u) => {
      if (seen.has(u.article_url)) return false;
      seen.add(u.article_url);
      return true;
    });

    console.log(`[IGG] Total unique: ${unique.length}`);

    if (unique.length === 0) {
      return NextResponse.json({
        ok: true,
        found: 0,
        saved: false,
        message: 'Aucun jeu trouvé sur IGG Games — le site a peut-être changé sa structure',
      });
    }

    const { data, error } = await supabase
      .from('game_updates')
      .upsert(unique, { onConflict: 'article_url' })
      .select();

    if (error) {
      console.error('[IGG] Supabase error:', error);
      return NextResponse.json(
        { ok: false, error: `Erreur base de données: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: 'IGGGames',
      pages_scraped: PAGES_TO_SCRAPE,
      found: unique.length,
      saved: true,
      inserted: data?.length ?? 0,
    });
  } catch (error) {
    console.error('[IGG] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
