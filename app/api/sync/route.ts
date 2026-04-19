import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { genericConfig, parseGenericHtml } from '../../../lib/scraper';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const cronSecret = process.env.CRON_SECRET!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest) {
  try {
    // 1) Vérification simple par URL
    const secretFromUrl = req.nextUrl.searchParams.get('secret');

    if (secretFromUrl !== cronSecret) {
      return NextResponse.json(
        { ok: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // 2) Choix : juste tester ou aussi sauvegarder
    const shouldSave = req.nextUrl.searchParams.get('save') === '1';

    // 3) URL à récupérer
    const targetUrl = genericConfig.baseUrl;

    // 4) Télécharge le HTML
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Impossible de récupérer la page (${response.status})`,
        },
        { status: 500 }
      );
    }

    // 5) Convertit la page en texte HTML
    const html = await response.text();

    // 6) Extrait les éléments avec le scraper
    const updates = parseGenericHtml(html, genericConfig);

    if (updates.length === 0) {
      return NextResponse.json({
        ok: true,
        found: 0,
        saved: false,
        message: 'Aucun élément trouvé. Vérifie les sélecteurs CSS.',
      });
    }

    // 7) Si on ne veut pas encore sauvegarder, on renvoie juste les résultats
    if (!shouldSave) {
      return NextResponse.json({
        ok: true,
        found: updates.length,
        saved: false,
        firstFive: updates.slice(0, 5),
      });
    }

    // 8) Sauvegarde dans Supabase
    const { data, error } = await supabase
      .from('game_updates')
      .upsert(updates, {
        onConflict: 'article_url',
      })
      .select();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    // 9) Réponse finale
    return NextResponse.json({
      ok: true,
      found: updates.length,
      saved: true,
      inserted: data?.length ?? 0,
      firstItem: updates[0] ?? null,
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