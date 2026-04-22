import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET() {
  try {
    // Get total updates count
    const { count: updatesCount, error: updatesError } = await supabase
      .from('game_updates')
      .select('*', { count: 'exact', head: true });

    if (updatesError) {
      return NextResponse.json({ error: updatesError.message }, { status: 500 });
    }

    // Get total details count
    const { count: detailsCount, error: detailsError } = await supabase
      .from('game_details')
      .select('*', { count: 'exact', head: true });

    if (detailsError) {
      return NextResponse.json({ error: detailsError.message }, { status: 500 });
    }

    // Get unique sources count
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('game_updates')
      .select('source');

    if (sourcesError) {
      return NextResponse.json({ error: sourcesError.message }, { status: 500 });
    }

    const uniqueSources = new Set(sourcesData?.map(item => item.source) || []);

    // Get recent updates
    const { data: recentData, error: recentError } = await supabase
      .from('game_updates')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(10);

    if (recentError) {
      return NextResponse.json({ error: recentError.message }, { status: 500 });
    }

    return NextResponse.json({
      updates: updatesCount || 0,
      details: detailsCount || 0,
      sources: uniqueSources.size,
      recent: recentData || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
