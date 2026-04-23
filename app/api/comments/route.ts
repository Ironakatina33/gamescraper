import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** GET — fetch comments for a game */
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'slug requis' }, { status: 400 });
    }

    const supabase = getAdmin();
    const { data, error } = await supabase
      .from('game_comments')
      .select('id, slug, author, content, created_at')
      .eq('slug', slug)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, comments: data ?? [] });
  } catch {
    return NextResponse.json({ ok: false, comments: [] }, { status: 500 });
  }
}

/** POST — add a comment */
export async function POST(req: NextRequest) {
  try {
    const { slug, author, content } = await req.json();

    if (!slug || !content || typeof content !== 'string') {
      return NextResponse.json({ ok: false, error: 'slug et content requis' }, { status: 400 });
    }

    const cleanContent = content.trim();
    if (cleanContent.length < 2 || cleanContent.length > 2000) {
      return NextResponse.json({ ok: false, error: 'Le commentaire doit faire entre 2 et 2000 caractères' }, { status: 400 });
    }

    const cleanAuthor = (author || 'Anonyme').trim().substring(0, 50);

    const supabase = getAdmin();
    const { data, error } = await supabase
      .from('game_comments')
      .insert({ slug, author: cleanAuthor, content: cleanContent })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, comment: data });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** DELETE — admin delete a comment */
export async function DELETE(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET || '14102004';
  const adminCookie = req.cookies.get('admin-auth')?.value;
  if (adminCookie !== adminSecret) {
    return NextResponse.json({ ok: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ ok: false, error: 'id requis' }, { status: 400 });
    }

    const supabase = getAdmin();
    const { error } = await supabase.from('game_comments').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
