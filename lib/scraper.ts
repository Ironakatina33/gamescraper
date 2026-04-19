import * as cheerio from 'cheerio';

export type ScrapedUpdate = {
  title: string;
  slug: string;
  source: string;
  article_url: string;
  image_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
};

export function parseGenericHtml(html: string): ScrapedUpdate[] {
  const $ = cheerio.load(html);
  const updates: ScrapedUpdate[] = [];

  $('.post, .article, .entry, .card').each((_, el) => {
    const title = $(el).find('h2 a, h3 a, .title a').first().text().trim();
    const article_url = $(el).find('h2 a, h3 a, .title a').first().attr('href')?.trim();
    const image_url = $(el).find('img').first().attr('src')?.trim() || null;
    const summary = $(el).find('p, .excerpt, .summary').first().text().trim() || null;
    const published_at = $(el).find('time').first().attr('datetime') || null;

    if (!title || !article_url) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    updates.push({
      title,
      slug,
      source: 'generic',
      article_url,
      image_url,
      summary,
      published_at,
    });
  });

  return updates;
}