import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Variables d\'environnement manquantes');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// Canonical source names — lowercase key → correct value
const SOURCE_MAP: Record<string, string> = {
  game3rb: 'Game3Rb',
  'game 3rb': 'Game3Rb',
  igggames: 'IGGGames',
  'igg games': 'IGGGames',
  'igg-games': 'IGGGames',
};

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET || '14102004';
  const adminCookie = req.cookies.get('admin-auth')?.value;
  if (adminCookie !== adminSecret) {
    return NextResponse.json({ ok: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Get all distinct sources
    const { data: rows, error: fetchErr } = await supabase
      .from('game_updates')
      .select('source');

    if (fetchErr) {
      return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
    }

    const uniqueSources = [...new Set((rows ?? []).map((r: any) => r.source))];
    const fixes: Array<{ from: string; to: string; count: number }> = [];

    for (const src of uniqueSources) {
      const canonical = SOURCE_MAP[src.toLowerCase()];
      if (canonical && canonical !== src) {
        // Update all rows with this source
        const { data, error } = await supabase
          .from('game_updates')
          .update({ source: canonical })
          .eq('source', src)
          .select('id');

        if (error) {
          fixes.push({ from: src, to: canonical, count: -1 });
        } else {
          fixes.push({ from: src, to: canonical, count: data?.length ?? 0 });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      sources_before: uniqueSources,
      fixes,
      message: fixes.length > 0
        ? `${fixes.reduce((s, f) => s + f.count, 0)} entrées corrigées`
        : 'Toutes les sources sont déjà normalisées',
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
