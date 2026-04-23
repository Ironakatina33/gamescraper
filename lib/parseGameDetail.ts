import * as cheerio from "cheerio";

export interface DownloadLink {
  url: string;
  text: string;
  host?: string;
}

export type ParsedGameDetail = {
  article_url: string;
  title: string | null;
  banner_image: string | null;
  screenshots: string[];
  trailer_url: string | null;
  about: string | null;
  release_name: string | null;
  release_size: string | null;
  developer: string | null;
  publisher: string | null;
  release_date: string | null;
  genre: string | null;
  reviews: string | null;
  system_requirements: string | null;
  download_links: DownloadLink[];
};

function clean(text?: string | null) {
  if (!text) return null;
  const v = text.replace(/\s+/g, " ").trim();
  return v || null;
}

function cleanMediaUrl(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return trimmed.replace(/&(amp;)?ssl=1/gi, "");
}

function pickFirstAttr(
  $: cheerio.CheerioAPI,
  selector: string,
  attrs: string[] = ["src", "data-src", "data-lazy-src", "data-original"]
) {
  const node = $(selector).first();
  for (const attr of attrs) {
    const value = cleanMediaUrl(node.attr(attr));
    if (value) return value;
  }
  return null;
}

function parseDetailsFromText(text: string) {
  const labels = [
    "RELEASE NAME",
    "RELEASE SIZE",
    "DEVELOPER",
    "PUBLISHER",
    "RELEASE DATE",
    "GENRE",
    "ALL REVIEWS",
    "REVIEWS",
  ];
  const result: Record<string, string> = {};

  const escapedLabels = labels
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const pairRegex = new RegExp(
    `(${escapedLabels})\\s*:\\s*(.+?)(?=\\s+(?:${escapedLabels})\\s*:|$)`,
    "gi"
  );

  let match = pairRegex.exec(text);
  while (match) {
    const label = match[1]?.trim().toLowerCase();
    const value = clean(match[2]);
    if (label && value) {
      result[label] = value;
    }
    match = pairRegex.exec(text);
  }

  return result;
}

function looksLikeDetailsBlob(text: string | null) {
  if (!text) return false;
  return /release name\s*:|release size\s*:|developer\s*:|publisher\s*:/i.test(text);
}

export function parseGameDetail(html: string, articleUrl: string): ParsedGameDetail {
  const $ = cheerio.load(html);

  const title =
    clean($(".post-title.entry-title").first().text()) ??
    clean($("h1").first().text());

  const banner_image =
    pickFirstAttr($, "#post-content .post-body > p img") ??
    pickFirstAttr($, "#post-content .post-body img") ??
    pickFirstAttr($, ".post-body img") ??
    null;

  const screenshots = $(".slideshow-container .mySlides img, .slideshow-container img, .post-body figure img")
    .map((_, el) => {
      for (const attr of ["src", "data-src", "data-lazy-src", "data-original"]) {
        const value = cleanMediaUrl($(el).attr(attr));
        if (value) return value;
      }
      return null;
    })
    .get()
    .filter((v): v is string => Boolean(v))
    .filter((v, idx, arr) => arr.indexOf(v) === idx);

  const trailer_url =
    pickFirstAttr($, "video source") ??
    pickFirstAttr($, "video") ??
    pickFirstAttr($, 'iframe[src*="youtube"], iframe[src*="steam"]', ["src"]) ??
    null;

  let about: string | null = null;
  $("h2, h3, h4").each((_, el) => {
    const txt = $(el).text().trim().toLowerCase();
    if (txt.includes("about this game") || txt.includes("about game")) {
      const next = $(el).next();
      about = clean(next.text());
    }
  });

  const details: Record<string, string> = {};

  $("#post-content .post-body p, #post-content .post-body li").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text) return;

    Object.assign(details, parseDetailsFromText(text));

    const strongLabel = $(el).find("strong").first().text().replace(":", "").trim();
    const rawAfterStrong = $(el).clone().find("strong").remove().end().text().trim();
    if (strongLabel && rawAfterStrong) {
      details[strongLabel.toLowerCase()] = clean(rawAfterStrong) ?? rawAfterStrong;
    }
  });

  let system_requirements: string | null = null;

  $("h2, h3, h4").each((_, el) => {
    const txt = $(el).text().trim().toLowerCase();
    if (txt.includes("system requirements")) {
      const chunks: string[] = [];
      let node = $(el).next();

      while (node.length && !["h2", "h3", "h4"].includes(node[0]?.tagName ?? "")) {
        if (node[0]?.tagName === "ul") {
          node.find("li").each((__, li) => {
            const liText = $(li).text().replace(/\s+/g, " ").trim();
            if (liText) chunks.push(`- ${liText}`);
          });
        } else {
          const text = node.text().replace(/\s+/g, " ").trim();
          if (text) chunks.push(text);
        }
        node = node.next();
      }

      system_requirements = chunks.length ? chunks.join("\n") : null;
    }
  });

  if (looksLikeDetailsBlob(about)) {
    const parsedFromAbout = parseDetailsFromText(about ?? "");
    Object.assign(details, parsedFromAbout);
    about = null;
  }

  if (!about) {
    const aboutCandidate = clean(
      $('#post-content .post-body p')
        .toArray()
        .map((el) => $(el).text().replace(/\s+/g, " ").trim())
        .find((text) => text.length > 80 && !looksLikeDetailsBlob(text))
    );
    about = aboutCandidate ?? null;
  }

  // Extract download links
  const download_links: DownloadLink[] = [];
  const seenUrls = new Set<string>();

  // Common download hosts patterns
  const downloadHosts = [
    'mega.nz', 'mega.co.nz', 'google.com', 'drive.google.com', 'mediafire.com',
    'zippyshare.com', 'uploadhaven.com', 'gofile.io', '1fichier.com',
    'rapidgator.net', 'uptobox.com', 'uploaded.net', 'filefactory.com',
    'turbobit.net', 'nitroflare.com', 'filerio.in', 'share-online.biz',
    'katfile.com', 'dl.free.fr', 'transfer.sh', 'we.tl', 'wetransfer.com',
    'pixeldrain.com', 'bowfile.com', 'megaup.net', 'drop.download',
    'anonfiles.com', 'bayfiles.com', '1drv.ms', 'onedrive.live.com',
    'thenewscasts.com', 'likegames.org', 'oxy.cloud', 'datanodes.to',
    'qiwi.gg', 'buzzheavier.com', 'krakenfiles.com', 'racaty.net'
  ];

  // Look for links in various contexts
  $('#post-content .post-body a, .post-body a, .download-links a, .links a').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();

    if (!href || seenUrls.has(href)) return;

    const lowerHref = href.toLowerCase();
    const lowerText = text.toLowerCase();

    // Check if it's a download link
    const isDownloadHost = downloadHosts.some(host => lowerHref.includes(host));
    const isDownloadText = /download|part|mirror|link|mega|drive|mediafire|zippy|gofile|thenewscasts/i.test(lowerText);
    const isDirectLink = /\.zip$|\.rar$|\.7z$|\.iso$|\.exe$|\.dmg$|\.pkg$/i.test(lowerHref);

    if (isDownloadHost || isDownloadText || isDirectLink) {
      seenUrls.add(href);

      // Determine host name
      let host: string | undefined;
      for (const h of downloadHosts) {
        if (lowerHref.includes(h)) {
          host = h.replace('.com', '').replace('.net', '').replace('.nz', '').replace('.io', '').replace('.co', '');
          break;
        }
      }

      download_links.push({
        url: href,
        text: text || 'Download Link',
        host: host || 'External Link'
      });
    }
  });

  // Also look for buttons or styled links that might be download buttons
  $('.download-button, .btn-download, [class*="download"], [class*="mega"], [class*="drive"]').each((_, el) => {
    const link = $(el).closest('a').attr('href') || $(el).find('a').attr('href');
    if (link && !seenUrls.has(link)) {
      seenUrls.add(link);
      download_links.push({
        url: link,
        text: $(el).text().trim() || 'Download',
        host: 'Download'
      });
    }
  });

  return {
    article_url: articleUrl,
    title,
    banner_image,
    screenshots,
    trailer_url,
    about,
    release_name: details["release name"] ?? null,
    release_size: details["release size"] ?? null,
    developer: details["developer"] ?? details["developers"] ?? null,
    publisher: details["publisher"] ?? null,
    release_date: details["release date"] ?? null,
    genre: details["genre"] ?? null,
    reviews: details["all reviews"] ?? details["reviews"] ?? null,
    system_requirements,
    download_links,
  };
}

/**
 * Parse game detail from IGG Games HTML.
 * IGG uses schema.org property attributes, UIkit classes,
 * and inline labels (Developer:, Publisher:, etc.)
 */
export function parseIggGameDetail(html: string, articleUrl: string): ParsedGameDetail {
  const $ = cheerio.load(html);

  const title =
    clean($('h1[property="headline"]').first().text()) ??
    clean($('h1.uk-article-title').first().text()) ??
    clean($('meta[property="name"]').attr('content'));

  // Banner — first .igg-image-content image
  const banner_image =
    cleanMediaUrl($('img.igg-image-content').first().attr('src')) ?? null;

  // Screenshots — subsequent .igg-image-content images (skip first = banner)
  const screenshots = $('img.igg-image-content')
    .slice(1)
    .map((_, el) => cleanMediaUrl($(el).attr('src')))
    .get()
    .filter((v): v is string => Boolean(v))
    .filter((v, idx, arr) => arr.indexOf(v) === idx);

  // Trailer
  const trailer_url =
    pickFirstAttr($, 'iframe[src*="youtube"], iframe[src*="steam"]', ['src']) ?? null;

  // Meta fields from inline text: "Developer:", "Publisher:", etc.
  const details: Record<string, string> = {};
  $('div[property="text"] p').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    const metaLabel = $(el).find('span.uk-text-meta').text().replace(':', '').trim().toLowerCase();
    if (metaLabel) {
      // Get text after the meta label
      const fullText = text;
      const labelIdx = fullText.toLowerCase().indexOf(metaLabel);
      if (labelIdx !== -1) {
        const value = fullText.substring(labelIdx + metaLabel.length).replace(/^[\s:]+/, '').trim();
        if (value) details[metaLabel] = value;
      }
    }
  });

  // About — collect paragraphs between "Game Overview" and "DOWNLOAD LINKS"
  let about: string | null = null;
  const aboutParts: string[] = [];
  let inAbout = false;

  $('div[property="text"]').children().each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    const text = $(el).text().replace(/\s+/g, ' ').trim();

    if (tag === 'h2' && /game overview/i.test(text)) {
      inAbout = true;
      return;
    }
    if (tag === 'h2' && /download/i.test(text)) {
      inAbout = false;
      return;
    }
    if (inAbout && tag === 'p' && text.length > 30) {
      // Skip lines that are just meta fields
      if ($(el).find('span.uk-text-meta').length) return;
      if ($(el).find('span.uk-label').length) return;
      aboutParts.push(text);
    }
  });

  about = aboutParts.length > 0 ? aboutParts.join('\n\n') : null;

  // Fallback about: use meta description
  if (!about) {
    about = clean($('meta[name="description"]').attr('content')) ?? null;
  }

  // Download links — look for links in the download section
  const download_links: DownloadLink[] = [];
  const seenUrls = new Set<string>();
  let inDownloads = false;

  $('div[property="text"]').children().each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    const text = $(el).text().replace(/\s+/g, ' ').trim();

    if (tag === 'h2' && /download/i.test(text)) {
      inDownloads = true;
      return;
    }
    if (inDownloads && tag === 'p') {
      $(el).find('a').each((__, a) => {
        const href = $(a).attr('href');
        const linkText = $(a).text().trim();
        if (!href || seenUrls.has(href)) return;
        // Skip internal igg links that are just ad redirects
        if (href.includes('igg-games.com/ubfdrnfd')) return;
        seenUrls.add(href);

        let host = 'External';
        try {
          host = new URL(href).hostname.replace('www.', '').split('.')[0];
        } catch { /* ignore */ }

        download_links.push({
          url: href,
          text: linkText || 'Download',
          host,
        });
      });
    }
  });

  // System requirements
  let system_requirements: string | null = null;
  $('div[property="text"] h2, div[property="text"] h3').each((_, el) => {
    const txt = $(el).text().trim().toLowerCase();
    if (txt.includes('system requirement') || txt.includes('minimum')) {
      const chunks: string[] = [];
      let node = $(el).next();
      while (node.length && !['h2', 'h3'].includes(node[0]?.tagName ?? '')) {
        if (node[0]?.tagName === 'ul') {
          node.find('li').each((__, li) => {
            const liText = $(li).text().replace(/\s+/g, ' ').trim();
            if (liText) chunks.push(`- ${liText}`);
          });
        } else {
          const text = node.text().replace(/\s+/g, ' ').trim();
          if (text && text.length > 5) chunks.push(text);
        }
        node = node.next();
      }
      system_requirements = chunks.length ? chunks.join('\n') : null;
    }
  });

  return {
    article_url: articleUrl,
    title: title ?? null,
    banner_image,
    screenshots,
    trailer_url,
    about,
    release_name: null,
    release_size: null,
    developer: details['developer'] ?? details['developers'] ?? null,
    publisher: details['publisher'] ?? null,
    release_date: details['release date'] ?? null,
    genre: details['genre'] ?? null,
    reviews: null,
    system_requirements,
    download_links,
  };
}

/**
 * Auto-detect source and parse game detail accordingly
 */
export function parseGameDetailAuto(html: string, articleUrl: string): ParsedGameDetail {
  if (articleUrl.includes('igg-games.com')) {
    return parseIggGameDetail(html, articleUrl);
  }
  return parseGameDetail(html, articleUrl);
}