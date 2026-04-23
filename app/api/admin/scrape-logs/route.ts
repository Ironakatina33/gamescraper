import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('scrape_logs')
      .select('id, source, started_at, finished_at, status, games_found, games_new, error')
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: data ?? [] });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}
