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
  ],
  imageSelectors: [
    'img.entry-image',
    'img.wp-post-image',
    'img.featured-image',
    '.post-thumbnail img',
    'img[src*="wp-content"]',
    'img',
  ],
  summarySelectors: [
    '.summaryy',
    '.entry-summary',
    '.post-summary',
    '.excerpt',
    'p',
  ],
  timeSelectors: [
    'time.entry-date',
    'time[datetime]',
    'time',
    '.published',
    '.post-date',
    'meta[property="article:published_time"]',
  ],
  source: 'game3rb',
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
