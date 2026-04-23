import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseGameDetailAuto } from "@/lib/parseGameDetail";

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
  const expected = `Bearer ${process.env.CRON_SECRET || '14102004'}`;
  const adminSecret = process.env.ADMIN_SECRET || '14102004';
  const adminCookie = req.cookies.get('admin-auth')?.value;

  const isAuthed =
    authHeader === expected ||
    adminCookie === adminSecret;

  if (!isAuthed) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const slug = req.nextUrl.searchParams.get("slug");
    const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "120");
    const limit = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(limitParam, 500))
      : 120;

    let query = supabase
      .from("game_updates")
      .select("article_url, slug, title")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (slug) {
      query = query.eq("slug", slug);
    }

    const { data: games, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const results = [];

    for (const game of games ?? []) {
      try {
        const response = await fetch(game.article_url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
            Referer: game.article_url.includes('igg-games.com') ? 'https://igg-games.com/' : 'https://game3rb.com/',
          },
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
        const parsed = parseGameDetailAuto(html, game.article_url);
        const hasMeaningfulData =
          Boolean(parsed.about) ||
          Boolean(parsed.banner_image) ||
          parsed.screenshots.length > 0 ||
          Boolean(parsed.system_requirements);

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
          parsed_data: hasMeaningfulData,
          screenshots: parsed.screenshots.length,
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
      slug: slug ?? null,
      limit,
      processed: results.length,
      success_count: results.filter((item) => item.ok).length,
      parsed_data_count: results.filter((item) => item.ok && item.parsed_data).length,
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