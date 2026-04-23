import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

// GET — list all games (paginated, searchable)
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const search = req.nextUrl.searchParams.get('search') || '';
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('game_updates')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%,source.ilike.%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

// POST — add a game manually
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const { title, source, article_url, image_url, summary } = body;

    if (!title || !source) {
      return NextResponse.json(
        { ok: false, error: 'title et source sont requis' },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const game = {
      title,
      slug,
      source,
      article_url: article_url || `manual://${slug}`,
      image_url: image_url || null,
      summary: summary || null,
      published_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('game_updates')
      .upsert(game, { onConflict: 'article_url' })
      .select();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data?.[0] ?? null });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

// DELETE — delete one or multiple games
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { ids } = body as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'ids[] requis' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('game_updates')
      .delete()
      .in('id', ids);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Also clean up any orphaned game_details
    const { data: remaining } = await supabase
      .from('game_updates')
      .select('article_url');

    if (remaining) {
      const validUrls = new Set(remaining.map((r) => r.article_url));
      const { data: details } = await supabase
        .from('game_details')
        .select('article_url');

      if (details) {
        const orphanUrls = details
          .map((d) => d.article_url)
          .filter((url: string) => !validUrls.has(url));

        if (orphanUrls.length > 0) {
          await supabase.from('game_details').delete().in('article_url', orphanUrls);
        }
      }
    }

    return NextResponse.json({ ok: true, deleted: ids.length });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
