import * as cheerio from 'cheerio';

export const genericConfig = {
  baseUrl: 'https://game3rb.com/',
  itemSelector: 'article.post-hentry',
  titleSelector: 'h3.entry-title a',
  linkSelector: 'h3.entry-title a',
  imageSelector: 'img.entry-image',
  summarySelector: '.summaryy',
  timeSelector: 'time.entry-date',
  source: 'game3rb',
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseGenericHtml(
  html: string,
  config: typeof genericConfig
) {
  const $ = cheerio.load(html);
  const results: any[] = [];

  $(config.itemSelector).each((_, el) => {
    const title = $(el).find(config.titleSelector).first().text().trim();
    const article_url = $(el).find(config.linkSelector).first().attr('href')?.trim() || '';
    const image_url = $(el).find(config.imageSelector).first().attr('src')?.trim() || '';
    const summary = $(el)
      .find(config.summarySelector)
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    const publishedRaw =
      $(el).find(config.timeSelector).first().attr('datetime')?.trim() || '';

    if (!title || !article_url) return;

    results.push({
      title,
      slug: slugify(title),
      source: config.source,
      article_url,
      image_url: image_url || null,
      summary: summary || null,
      published_at: publishedRaw
        ? new Date(publishedRaw).toISOString()
        : new Date().toISOString(),
    });
  });

  return results;
}