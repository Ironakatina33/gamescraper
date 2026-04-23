/**
 * Game Scraper Module
 * 
 * This module handles HTML parsing for game update scraping from various sources.
 * Uses cheerio for server-side DOM manipulation with multiple fallback selectors
 * for maximum compatibility with different site structures.
 * 
 * @module lib/scraper
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Game Scraper Module
 * 
 * This module handles HTML parsing for game update scraping from various sources.
 * Uses cheerio for server-side DOM manipulation with multiple fallback selectors
 * for maximum compatibility with different site structures.
 * 
 * @module lib/scraper
 */

import * as cheerio from 'cheerio';

/** Configuration interface for scraper behavior */
export interface ScraperConfig {
  baseUrl: string;
  itemSelectors: string[];
  titleSelectors: string[];
  linkSelectors: string[];
  imageSelectors: string[];
  summarySelectors: string[];
  timeSelectors: string[];
  source: string;
}

/** Result of a scraped game entry */
export interface ScrapedGame {
  title: string;
  slug: string;
  source: string;
  article_url: string;
  image_url: string | null;
  summary: string | null;
  published_at: string;
}

/**
 * Default configuration for game3rb.com
 * Includes multiple fallback selectors for resilience
 */
export const genericConfig: ScraperConfig = {
  baseUrl: 'https://game3rb.com/',
  itemSelectors: [
    'article.post-hentry',
    'article.post',
    '.post-item',
    '.blog-post',
    'article',
    '.post-outer',
    '.item',
    '.game-item',
  ],
  titleSelectors: [
    'h3.entry-title a',
    'h2.entry-title a',
    'h1.entry-title a',
    '.post-title a',
    'h3 a',
    'h2 a',
    '.title a',
    'a[rel="bookmark"]',
    '.entry-header a',
    '.game-title a',
  ],
  linkSelectors: [
    'h3.entry-title a',
    'h2.entry-title a',
    '.post-title a',
    'a[rel="bookmark"]',
    'h3 a',
    'h2 a',
    '.read-more',
    'a',
    '.entry-header a',
    '.game-link a',
  ],
  imageSelectors: [
    'img.entry-image',
    'img.wp-post-image',
    'img.featured-image',
    '.post-thumbnail img',
    'img[src*="wp-content"]',
    'img',
    '.game-image img',
    '.thumbnail img',
  ],
  summarySelectors: [
    '.summaryy',
    '.entry-summary',
    '.post-summary',
    '.excerpt',
    'p',
    '.entry-content p:first',
    '.game-summary',
    '.description',
  ],
  timeSelectors: [
    'time.entry-date',
    'time[datetime]',
    'time',
    '.entry-date',
    '.post-date',
    '.published',
    '.game-date',
  ],
  source: 'Game3Rb',
};

/** Convert text to URL-friendly slug */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Find first matching text/attribute from multiple selectors */
function findFirst(
  $: any,
  parent: any,
  selectors: string[],
  attr?: string
): string | null {
  for (const selector of selectors) {
    const element = parent.find(selector).first();
    if (element.length) {
      if (attr) {
        const value = element.attr(attr);
        if (value) return value.trim();
      } else {
        const text = element.text().trim();
        if (text) return text;
      }
    }
  }
  return null;
}

/** Parse date from various formats */
function parseDate(
  $: any,
  parent: any,
  selectors: string[]
): string | null {
  for (const selector of selectors) {
    const element = parent.find(selector).first();
    if (element.length) {
      const datetime = element.attr('datetime');
      if (datetime) return datetime.trim();

      const content = element.attr('content');
      if (content) return content.trim();

      const text = element.text().trim();
      if (text) {
        const parsed = new Date(text);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString();
        }
      }
    }
  }
  return null;
}

/** Clean and validate image URL */
function cleanImageUrl(url: string | null): string | null {
  if (!url) return null;
  const cleaned = url.trim();
  if (!cleaned || cleaned.startsWith('data:')) return null;
  return cleaned.replace(/&(amp;)?ssl=1/gi, '');
}

/** Extract summary text from content */
function extractSummary(
  $: any,
  parent: any,
  selectors: string[]
): string | null {
  for (const selector of selectors) {
    const element = parent.find(selector).first();
    if (element.length) {
      const text = element.text().replace(/\s+/g, ' ').trim();
      if (text && text.length > 10) {
        return text.length > 300 ? text.substring(0, 297) + '...' : text;
      }
    }
  }
  return null;
}

/**
 * Parse HTML using provided configuration
 * @param html - Raw HTML content to parse
 * @param config - Scraper configuration with selectors
 * @returns Array of scraped game entries
 */
export function parseGenericHtml(
  html: string,
  config: ScraperConfig
): ScrapedGame[] {
  const $ = cheerio.load(html);
  const results: ScrapedGame[] = [];

  // Find items using fallback selectors
  let itemElements: any = null;
  for (const selector of config.itemSelectors) {
    itemElements = $(selector);
    if (itemElements && itemElements.length > 0) break;
  }

  if (!itemElements || itemElements.length === 0) {
    console.warn('No items found with any selector');
    return results;
  }

  itemElements.each((_: number, el: any) => {
    const $el = $(el);

    const title = findFirst($, $el, config.titleSelectors);
    if (!title) return;

    const article_url = findFirst($, $el, config.linkSelectors, 'href');
    if (!article_url) return;

    const image_url = cleanImageUrl(
      findFirst($, $el, config.imageSelectors, 'src') ||
      findFirst($, $el, config.imageSelectors, 'data-src') ||
      findFirst($, $el, config.imageSelectors, 'data-lazy-src')
    );

    const summary = extractSummary($, $el, config.summarySelectors);
    const publishedRaw = parseDate($, $el, config.timeSelectors);

    results.push({
      title,
      slug: slugify(title),
      source: config.source,
      article_url: article_url.startsWith('http')
        ? article_url
        : new URL(article_url, config.baseUrl).href,
      image_url,
      summary,
      published_at: publishedRaw || new Date().toISOString(),
    });
  });

  return results;
}

/**
 * Configuration for igg-games.com
 * Uses schema.org property attributes and UIkit markup
 */
export const iggConfig: ScraperConfig = {
  baseUrl: 'https://igg-games.com/',
  itemSelectors: [
    'article.uk-article',
    'article[typeof="Article"]',
    'article',
  ],
  titleSelectors: [
    'h2[property="headline"] a',
    'h1[property="headline"]',
    'h2.uk-article-title a',
    'h1.uk-article-title',
  ],
  linkSelectors: [
    'h2[property="headline"] a',
    'h2.uk-article-title a',
    'div[property="image"] a',
  ],
  imageSelectors: [
    'div[property="image"] meta[property="url"]',
    'div[property="image"] img',
    'img.igg-image-content',
  ],
  summarySelectors: [
    'div[property="text"]',
    '.uk-margin-medium-top[property="text"]',
  ],
  timeSelectors: [
    'time[datetime]',
    'meta[property="datePublished"]',
  ],
  source: 'IGGGames',
};

/**
 * Parse IGG Games HTML — specialised parser because IGG uses
 * schema.org `property` attributes and meta tags for images
 * instead of standard src attributes.
 */
export function parseIggHtml(html: string): ScrapedGame[] {
  const $ = cheerio.load(html);
  const results: ScrapedGame[] = [];

  $('article.uk-article, article[typeof="Article"]').each((_: number, el: any) => {
    const $el = $(el);

    // Title — from meta property="name" first, then h2/h1
    const title =
      $el.find('meta[property="name"]').attr('content')?.trim() ||
      $el.find('h2[property="headline"] a').first().text().trim() ||
      $el.find('h1[property="headline"]').first().text().trim();

    if (!title) return;

    // Clean title: remove " Free Download" suffix and emojis for slug
    const cleanTitle = title
      .replace(/\s*Free Download.*$/i, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .trim();

    // Link
    const article_url =
      $el.find('h2[property="headline"] a').attr('href') ||
      $el.find('h1[property="headline"] a').attr('href') ||
      $el.find('div[property="image"] a').attr('href');

    if (!article_url) return;

    const fullUrl = article_url.startsWith('http')
      ? article_url
      : new URL(article_url, iggConfig.baseUrl).href;

    // Image — IGG stores the thumbnail in a <meta property="url"> inside the image div
    let image_url: string | null =
      $el.find('div[property="image"] meta[property="url"]').attr('content')?.trim() || null;

    // Fallback: try img tags
    if (!image_url) {
      image_url =
        $el.find('div[property="image"] img').attr('src')?.trim() ||
        $el.find('div[property="image"] img').attr('data-src')?.trim() ||
        null;
    }

    // Get full-size image (remove -210x210 thumbnail suffix)
    if (image_url) {
      image_url = image_url.replace(/-\d+x\d+(\.\w+)$/, '$1');
      if (!image_url.startsWith('http')) {
        image_url = new URL(image_url, iggConfig.baseUrl).href;
      }
    }

    // Date
    const dateStr =
      $el.find('time[datetime]').attr('datetime')?.trim() ||
      $el.find('meta[property="datePublished"]').attr('content')?.trim() ||
      null;

    // Summary — the text div
    let summary =
      $el.find('div[property="text"]').text().replace(/\s+/g, ' ').trim() || null;

    if (summary && summary.length > 300) {
      summary = summary.substring(0, 297) + '...';
    }

    results.push({
      title,
      slug: slugify(cleanTitle || title),
      source: iggConfig.source,
      article_url: fullUrl,
      image_url: cleanImageUrl(image_url),
      summary,
      published_at: dateStr || new Date().toISOString(),
    });
  });

  return results;
}

/**
 * Try multiple configurations to parse HTML
 * @param html - Raw HTML content
 * @param baseUrl - Base URL for resolving relative links
 * @returns Array of scraped game entries
 */
export function parseMultipleSources(
  html: string,
  baseUrl: string
): ScrapedGame[] {
  const configs: ScraperConfig[] = [
    genericConfig,
    {
      ...genericConfig,
      baseUrl,
      source: 'auto-detected',
    },
  ];

  for (const config of configs) {
    const results = parseGenericHtml(html, config);
    if (results.length > 0) {
      return results;
    }
  }

  return [];
}
