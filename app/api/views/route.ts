import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function hashIP(ip: string): string {
  // Simple hash — no PII stored
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash + ip.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

/** POST — record a page view */
export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ua = req.headers.get('user-agent') || '';
    const supabase = getAdmin();

    // Insert view event
    await supabase.from('game_views').insert({
      slug,
      ip_hash: hashIP(ip),
      user_agent: ua.substring(0, 200),
    });

    // Increment counter (upsert)
    const { data: existing } = await supabase
      .from('game_view_counts')
      .select('view_count')
      .eq('slug', slug)
      .single();

    if (existing) {
      await supabase
        .from('game_view_counts')
        .update({ view_count: existing.view_count + 1, updated_at: new Date().toISOString() })
        .eq('slug', slug);
    } else {
      await supabase
        .from('game_view_counts')
        .insert({ slug, view_count: 1 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** GET — get view count(s) */
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    const supabase = getAdmin();

    if (slug) {
      const { data } = await supabase
        .from('game_view_counts')
        .select('view_count')
        .eq('slug', slug)
        .single();
      return NextResponse.json({ slug, views: data?.view_count ?? 0 });
    }

    // Top games by views
    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') || '20'), 100);
    const { data } = await supabase
      .from('game_view_counts')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(limit);

    return NextResponse.json({ top: data ?? [] });
  } catch {
    return NextResponse.json({ top: [] }, { status: 500 });
  }
}
