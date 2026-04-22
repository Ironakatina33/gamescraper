/* eslint-disable @typescript-eslint/no-explicit-any */
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
    'anonfiles.com', 'bayfiles.com', '1drv.ms', 'onedrive.live.com'
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
    const isDownloadText = /download|part|mirror|link|mega|drive|mediafire|zippy|gofile/i.test(lowerText);
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