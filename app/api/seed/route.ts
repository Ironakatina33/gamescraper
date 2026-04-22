import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const sampleGames = [
  {
    title: 'Cyberpunk 2077 Update 2.1',
    slug: 'cyberpunk-2077-update-2-1',
    source: 'game3rb',
    article_url: 'https://game3rb.com/cyberpunk-2077-update-2-1',
    image_url: 'https://via.placeholder.com/800x400/1a1a2e/16213e?text=Cyberpunk+2077',
    summary: 'Nouvelle mise à jour majeure pour Cyberpunk 2077 avec des améliorations graphiques, des corrections de bugs et de nouveaux contenus. Cette version optimise les performances sur console nouvelle génération.',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    title: 'Baldur\'s Gate 3 - Patch Hotfix 5',
    slug: 'baldurs-gate-3-patch-hotfix-5',
    source: 'game3rb',
    article_url: 'https://game3rb.com/baldurs-gate-3-hotfix-5',
    image_url: 'https://via.placeholder.com/800x400/2d1b69/6a0572?text=Baldur+Gate+3',
    summary: 'Correctifs critiques pour les crashes de fin de jeu, amélioration de l\'IA des compagnons et optimisation des performances en multijoueur.',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    title: 'Starfield Expansion DLC Announced',
    slug: 'starfield-expansion-dlc-announced',
    source: 'game3rb',
    article_url: 'https://game3rb.com/starfield-dlc',
    image_url: 'https://via.placeholder.com/800x400/0f3443/34e89e?text=Starfield',
    summary: 'Bethesda annonce le premier DLC majeur pour Starfield avec de nouvelles planètes à explorer, des quêtes étendues et des vaisseaux personnalisables.',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    title: 'Hogwarts Legacy - Performance Patch',
    slug: 'hogwarts-legacy-performance-patch',
    source: 'game3rb',
    article_url: 'https://game3rb.com/hogwarts-legacy-patch',
    image_url: 'https://via.placeholder.com/800x400/1e3a8a/7c3aed?text=Hogwarts+Legacy',
    summary: 'Mise à jour optimisant les performances sur PC, ajout du support DLSS 3 et correction des problèmes de texture sur RTX.',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    title: 'Elden Ring - New Game Plus Update',
    slug: 'elden-ring-new-game-plus',
    source: 'game3rb',
    article_url: 'https://game3rb.com/elden-ring-ng-plus',
    image_url: 'https://via.placeholder.com/800x400/1a1a1a/d4af37?text=Elden+Ring',
    summary: 'Le mode New Game Plus arrive enfin avec des ennemis améliorés, de nouveaux objets légendaires et des changements dans les boss fights.',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
];

export async function GET() {
  try {
    // Vérifier si des données existent déjà
    const { data: existing } = await supabase
      .from('game_updates')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      // Retourner les données existantes
      const { data: allData } = await supabase
        .from('game_updates')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);

      return NextResponse.json({ 
        ok: true, 
        data: allData,
        message: 'Données existantes chargées'
      });
    }

    // Insérer les données d'exemple
    const { data, error } = await supabase
      .from('game_updates')
      .insert(sampleGames)
      .select();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      data,
      message: `${sampleGames.length} jeux d\'exemple ajoutés`
    });
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
}