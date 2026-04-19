import * as cheerio from 'cheerio';

export type ScrapedGameUpdate = {
  title: string;
  slug: string;
  source: string;
  article_url: string;
  image_url: string | null;
  summary: string | null;
  published_at: string | null;
};

type ScraperConfig = {
  sourceName: string;
  baseUrl: string;
  listItemSelector: string;
  titleSelector: string;
  linkSelector: string;
  summarySelector?: string;
  imageSelector?: string;
  dateSelector?: string;
  dateAttribute?: string;
  imageAttribute?: string;
  linkAttribute?: string;
};

function cleanText(text: string | undefined | null) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeAbsoluteUrl(baseUrl: string, value: string | undefined | null) {
  if (!value) return '';

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

function tryParseDate(value: string | undefined | null) {
  if (!value) return null;

  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const date = new Date(cleaned);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

export function parseGenericHtml(
  html: string,
  config: ScraperConfig
): ScrapedGameUpdate[] {
  const $ = cheerio.load(html);
  const results: ScrapedGameUpdate[] = [];

  $(config.listItemSelector).each((_, element) => {
    const root = $(element);

    const title = cleanText(root.find(config.titleSelector).first().text());

    const rawLink =
      root.find(config.linkSelector).first().attr(config.linkAttribute || 'href') || '';

    const rawSummary = config.summarySelector
      ? cleanText(root.find(config.summarySelector).first().text())
      : '';

    const rawImage = config.imageSelector
      ? root.find(config.imageSelector).first().attr(config.imageAttribute || 'src') || ''
      : '';

    let rawDate = '';
    if (config.dateSelector) {
      const dateElement = root.find(config.dateSelector).first();
      rawDate = config.dateAttribute
        ? dateElement.attr(config.dateAttribute) || ''
        : dateElement.text();
    }

    const articleUrl = makeAbsoluteUrl(config.baseUrl, rawLink);
    const imageUrl = rawImage ? makeAbsoluteUrl(config.baseUrl, rawImage) : null;

    if (!title || !articleUrl) return;

    results.push({
      title,
      slug: slugify(title),
      source: config.sourceName,
      article_url: articleUrl,
      image_url: imageUrl,
      summary: rawSummary || null,
      published_at: tryParseDate(rawDate),
    });
  });

  return results;
}

export const genericConfig: ScraperConfig = {
  sourceName: 'game3rb',
  baseUrl: 'https://game3rb.com',

  listItemSelector: 'article.post-hentry',
  titleSelector: '.entry-title a',
  linkSelector: '.entry-title a',
  summarySelector: '.summaryy',
  imageSelector: 'img.entry-image',
  dateSelector: 'time.entry-date',

  linkAttribute: 'href',
  imageAttribute: 'src',
  dateAttribute: 'datetime',
};