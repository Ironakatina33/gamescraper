import * as cheerio from "cheerio";

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

function getLabelValue(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}\\s*:\\s*(.+)$`, "i"));
  return match?.[1]?.trim() ?? null;
}

export function parseGameDetail(html: string, articleUrl: string): ParsedGameDetail {
  const $ = cheerio.load(html);

  const title =
    clean($(".post-title.entry-title").first().text()) ??
    clean($("h1").first().text());

  const banner_image =
    cleanMediaUrl($("#post-content .post-body > p img").first().attr("src")) ??
    cleanMediaUrl($("#post-content .post-body img").first().attr("src")) ??
    null;

  const screenshots = $(".slideshow-container .mySlides img, .slideshow-container img")
    .map((_, el) => cleanMediaUrl($(el).attr("src")))
    .get()
    .filter((v): v is string => Boolean(v))
    .filter((v, idx, arr) => arr.indexOf(v) === idx);

  const trailer_url =
    cleanMediaUrl($("video source").first().attr("src")) ??
    cleanMediaUrl($("video").first().attr("src")) ??
    $('iframe[src*="youtube"], iframe[src*="steam"]').first().attr("src") ??
    null;

  let about: string | null = null;
  $("h3").each((_, el) => {
    const txt = $(el).text().trim().toLowerCase();
    if (txt.includes("about this game")) {
      const next = $(el).next();
      about = clean(next.text());
    }
  });

  const details: Record<string, string> = {};

  $("#post-content .post-body p").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text) return;

    const labels = [
      "RELEASE NAME",
      "RELEASE SIZE",
      "DEVELOPER",
      "PUBLISHER",
      "RELEASE DATE",
      "GENRE",
      "ALL REVIEWS",
    ];

    for (const label of labels) {
      const value = getLabelValue(text, label);
      if (value) {
        details[label.toLowerCase()] = value;
      }
    }
  });

  let system_requirements: string | null = null;

  $("h3").each((_, el) => {
    const txt = $(el).text().trim().toLowerCase();
    if (txt.includes("system requirements")) {
      const chunks: string[] = [];
      let node = $(el).next();

      while (node.length && node[0]?.tagName !== "h3") {
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

  return {
    article_url: articleUrl,
    title,
    banner_image,
    screenshots,
    trailer_url,
    about,
    release_name: details["release name"] ?? null,
    release_size: details["release size"] ?? null,
    developer: details["developer"] ?? null,
    publisher: details["publisher"] ?? null,
    release_date: details["release date"] ?? null,
    genre: details["genre"] ?? null,
    reviews: details["all reviews"] ?? null,
    system_requirements,
  };
}