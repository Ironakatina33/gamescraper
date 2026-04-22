import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseGameDetail } from "@/lib/parseGameDetail";

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Variables d'environnement manquantes: NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expected) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    const { data: games, error } = await supabase
      .from("game_updates")
      .select("article_url, slug, title")
      .order("published_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const results = [];

    for (const game of games ?? []) {
      try {
        const response = await fetch(game.article_url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          cache: "no-store",
        });

        if (!response.ok) {
          results.push({
            article_url: game.article_url,
            ok: false,
            error: `HTTP ${response.status}`,
          });
          continue;
        }

        const html = await response.text();
        const parsed = parseGameDetail(html, game.article_url);

        const { error: upsertError } = await supabase
          .from("game_details")
          .upsert(
            {
              ...parsed,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "article_url" }
          );

        if (upsertError) {
          results.push({
            article_url: game.article_url,
            ok: false,
            error: upsertError.message,
          });
          continue;
        }

        results.push({
          article_url: game.article_url,
          ok: true,
        });
      } catch (e) {
        results.push({
          article_url: game.article_url,
          ok: false,
          error: e instanceof Error ? e.message : "Erreur inconnue",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      processed: results.length,
      results,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}