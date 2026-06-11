import type { Marketplace } from "@/types/commerce";

const BRIGHTDATA_ENDPOINT = "https://api.brightdata.com/request";
const DEFAULT_ZONE = "web_unlocker1";
const USD_TO_KZT = 480;
const EUR_TO_KZT = 520;

export type ParsedMarketplaceOffer = {
  id: string;
  marketplace: Marketplace;
  title: string;
  imageUrl: string;
  priceText?: string;
  priceKzt?: number;
  rating?: number;
  reviews?: number;
  sourceUrl: string;
  originCountry: string;
};

type ParseOptions = {
  query?: string;
  limit?: number;
};

const marketplaceOrigins: Record<Marketplace, string> = {
  Amazon: "US",
  AliExpress: "CN",
  Alibaba: "CN",
  Trendyol: "TR",
  Temu: "CN",
  eBay: "US",
  Shein: "CN",
  Ozon: "KZ",
};

export function buildMarketplaceSearchUrl(
  marketplace: Marketplace,
  query: string,
) {
  const encoded = encodeURIComponent(query);

  const urls: Record<Marketplace, string> = {
    Amazon: `https://www.amazon.com/s?k=${encoded}`,
    AliExpress: `https://www.aliexpress.com/wholesale?SearchText=${encoded}`,
    Alibaba: `https://www.alibaba.com/trade/search?SearchText=${encoded}`,
    Trendyol: `https://www.trendyol.com/sr?q=${encoded}`,
    Temu: `https://www.temu.com/search_result.html?search_key=${encoded}`,
    eBay: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
    Shein: `https://www.shein.com/pdsearch/${encoded}/`,
    Ozon: `https://www.ozon.ru/search/?text=${encoded}`,
  };

  return urls[marketplace];
}

export function detectMarketplace(url: string): Marketplace {
  const host = safeHost(url);

  if (host.includes("alibaba")) return "Alibaba";
  if (host.includes("aliexpress")) return "AliExpress";
  if (host.includes("trendyol")) return "Trendyol";
  if (host.includes("temu")) return "Temu";
  if (host.includes("ebay")) return "eBay";
  if (host.includes("shein")) return "Shein";
  if (host.includes("ozon")) return "Ozon";

  return "Amazon";
}

export async function fetchWithBrightData(url: string) {
  const apiKey = process.env.BRIGHTDATA_API_KEY;
  const zone = process.env.BRIGHTDATA_ZONE ?? DEFAULT_ZONE;

  if (!apiKey) {
    throw new Error("BRIGHTDATA_API_KEY is not configured");
  }

  const response = await fetch(BRIGHTDATA_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      zone,
      url,
      format: "raw",
    }),
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Bright Data request failed (${response.status}): ${text.slice(0, 240)}`,
    );
  }

  return text;
}

export function parseMarketplaceOffers(
  html: string,
  sourceUrl: string,
  options: ParseOptions = {},
) {
  const marketplace = detectMarketplace(sourceUrl);
  const offers =
    marketplace === "Amazon"
      ? parseAmazonOffers(html, sourceUrl)
      : marketplace === "eBay"
        ? parseEbayOffers(html, sourceUrl)
      : parseGenericOffers(html, sourceUrl, options.query);

  return uniqueOffers(offers)
    .filter((offer) => offer.title && offer.imageUrl)
    .sort((a, b) => (a.priceKzt ?? Number.MAX_SAFE_INTEGER) - (b.priceKzt ?? Number.MAX_SAFE_INTEGER))
    .slice(0, options.limit ?? 24);
}

function parseAmazonOffers(
  html: string,
  sourceUrl: string,
): ParsedMarketplaceOffer[] {
  const marketplace = detectMarketplace(sourceUrl);
  const blocks =
    html.match(
      /<div[^>]+data-component-type=["']s-search-result["'][\s\S]*?(?=<div[^>]+data-component-type=["']s-search-result["']|<div id=["']navFooter|<\/body>)/gi,
    ) ?? [];

  return blocks
    .map((block, index): ParsedMarketplaceOffer | null => {
      const imageTag =
        block.match(/<img[^>]+class=["'][^"']*s-image[^"']*["'][^>]*>/i)?.[0] ??
        block.match(/<img[^>]*>/i)?.[0] ??
        "";
      const imageUrl = normalizeUrl(
        getAttribute(imageTag, "src") || getAttribute(imageTag, "data-src"),
        sourceUrl,
      );
      const asin = decodeHtml(matchFirst(block, /data-asin=["']([^"']+)["']/i));
      const imageAlt = decodeHtml(getAttribute(imageTag, "alt"));
      const h2Text = stripTags(matchFirst(block, /<h2[\s\S]*?<\/h2>/i));
      const title = cleanText(imageAlt || h2Text);
      const href =
        matchFirst(block, /<a[^>]+href=["']([^"']*(?:\/dp\/|\/gp\/product\/)[^"']*)["']/i) ||
        matchFirst(block, /<a[^>]+href=["']([^"']+)["']/i);
      const productUrl = normalizeUrl(href, sourceUrl) || sourceUrl;
      const priceText = cleanText(
        stripTags(
          matchFirst(
            block,
            /<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
          ),
        ),
      );
      const rating = parseNumber(
        matchFirst(block, /([0-5](?:[.,]\d)?)\s*out of\s*5/i),
      );
      const reviews = parseReviews(block);

      if (!title || !looksLikeProductImage(imageUrl)) {
        return null;
      }

      return {
        id: asin || `amazon-${index}`,
        marketplace,
        title,
        imageUrl,
        priceText: priceText || undefined,
        priceKzt: parsePriceToKzt(priceText),
        rating: rating ?? undefined,
        reviews: reviews ?? undefined,
        sourceUrl: productUrl,
        originCountry: marketplaceOrigins[marketplace],
      };
    })
    .filter((offer): offer is ParsedMarketplaceOffer => Boolean(offer));
}

function parseEbayOffers(
  html: string,
  sourceUrl: string,
): ParsedMarketplaceOffer[] {
  const marketplace = detectMarketplace(sourceUrl);
  const blocks =
    html.match(
      /<li[^>]+class=["'][^"']*(?:s-item|s-card)[^"']*["'][\s\S]*?(?=<li[^>]+class=["'][^"']*(?:s-item|s-card)[^"']*["']|<\/ul>)/gi,
    ) ?? [];

  return blocks
    .map((block, index): ParsedMarketplaceOffer | null => {
      const title = cleanText(
        stripTags(
          matchFirst(
            block,
            /<div[^>]+class=["'][^"']*s-item__title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
          ) ||
            matchFirst(
              block,
              /<div[^>]+class=["'][^"']*s-card__title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
          ) ||
            matchFirst(
              block,
              /<span[^>]+role=["']heading["'][^>]*>([\s\S]*?)<\/span>/i,
            ),
        ),
      );
      const imageTag =
        block.match(/<img[^>]+class=["'][^"']*s-item__image-img[^"']*["'][^>]*>/i)?.[0] ??
        block.match(/<img[^>]+class=["'][^"']*s-card__image[^"']*["'][^>]*>/i)?.[0] ??
        block.match(/<img[^>]*>/i)?.[0] ??
        "";
      const imageUrl = firstUsableImageFromTag(imageTag, sourceUrl);
      const priceText = cleanText(
        stripTags(
          matchFirst(block, /<span[^>]+class=["'][^"']*s-item__price[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
            matchFirst(block, /<span[^>]+class=["'][^"']*s-card__price[^"']*["'][^>]*>([\s\S]*?)<\/span>/i),
        ),
      );
      const href =
        matchFirst(
          block,
          /<a[^>]+class=["'][^"']*s-item__link[^"']*["'][^>]+href=["']([^"']+)["']/i,
        ) ||
        matchFirst(
          block,
          /<a[^>]+class=["'][^"']*s-card__link[^"']*["'][^>]+href=["']([^"']+)["']/i,
        ) ||
        matchFirst(block, /<a[^>]+href=["']([^"']+)["']/i);
      const productUrl = normalizeUrl(href, sourceUrl) || sourceUrl;

      if (
        !title ||
        /shop on ebay/i.test(title) ||
        !looksLikeProductImage(imageUrl)
      ) {
        return null;
      }

      return {
        id: `ebay-${index}-${slugFromUrl(productUrl)}`,
        marketplace,
        title,
        imageUrl,
        priceText: priceText || undefined,
        priceKzt: parsePriceToKzt(priceText),
        sourceUrl: productUrl,
        originCountry: marketplaceOrigins[marketplace],
      };
    })
    .filter((offer): offer is ParsedMarketplaceOffer => Boolean(offer));
}

function parseGenericOffers(
  html: string,
  sourceUrl: string,
  query?: string,
): ParsedMarketplaceOffer[] {
  const jsonLdOffers = parseJsonLdProducts(html, sourceUrl);

  if (jsonLdOffers.length > 0) {
    return jsonLdOffers;
  }

  const marketplace = detectMarketplace(sourceUrl);
  const title =
    metaContent(html, "og:title") ||
    metaContent(html, "twitter:title") ||
    stripTags(matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i)) ||
    query ||
    marketplace;
  const imageUrl = normalizeUrl(
    metaContent(html, "og:image") ||
      metaContent(html, "twitter:image") ||
      firstImage(html),
    sourceUrl,
  );
  const priceText = cleanText(
    matchFirst(
      html,
      /((?:[$]|USD|EUR|KZT|тг|тенге|₸)\s*[\d\s.,]+|[\d\s.,]+\s*(?:[$]|USD|EUR|KZT|тг|тенге|₸))/i,
    ),
  );

  if (!title || !looksLikeProductImage(imageUrl)) {
    return [];
  }

  const offer: ParsedMarketplaceOffer = {
    id: `${marketplace.toLowerCase()}-generic`,
    marketplace,
    title: cleanText(title),
    imageUrl,
    priceText: priceText || undefined,
    priceKzt: parsePriceToKzt(priceText),
    sourceUrl,
    originCountry: marketplaceOrigins[marketplace],
  };

  return [offer];
}

function parseJsonLdProducts(
  html: string,
  sourceUrl: string,
): ParsedMarketplaceOffer[] {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const products: unknown[] = [];

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(decodeHtml(script[1]).trim());
      collectJsonProducts(parsed, products);
    } catch {
      // Ignore malformed JSON-LD blocks from marketplace pages.
    }
  }

  return products
    .map((item, index) => jsonProductToOffer(item, sourceUrl, index))
    .filter((offer): offer is ParsedMarketplaceOffer => Boolean(offer));
}

function collectJsonProducts(value: unknown, products: unknown[]) {
  if (Array.isArray(value)) {
    for (const item of value) collectJsonProducts(item, products);
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  const type = value["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((item) => String(item).toLowerCase() === "product")) {
    products.push(value);
    return;
  }

  for (const key of ["@graph", "itemListElement", "mainEntity"]) {
    if (key in value) {
      collectJsonProducts(value[key], products);
    }
  }
}

function jsonProductToOffer(
  value: unknown,
  sourceUrl: string,
  index: number,
): ParsedMarketplaceOffer | null {
  if (!isRecord(value)) return null;

  const marketplace = detectMarketplace(sourceUrl);
  const offer = Array.isArray(value.offers) ? value.offers[0] : value.offers;
  const offerRecord = isRecord(offer) ? offer : {};
  const image = Array.isArray(value.image) ? value.image[0] : value.image;
  const imageUrl = normalizeUrl(extractImageUrl(image), sourceUrl);
  const title = cleanText(String(value.name ?? ""));
  const price = offerRecord.price ?? offerRecord.lowPrice;
  const currency = String(offerRecord.priceCurrency ?? "");
  const priceText = price ? `${currency} ${price}`.trim() : undefined;
  const productUrl = normalizeUrl(String(offerRecord.url ?? value.url ?? ""), sourceUrl);

  if (!title || !looksLikeProductImage(imageUrl)) {
    return null;
  }

  return {
    id: `${marketplace.toLowerCase()}-jsonld-${index}`,
    marketplace,
    title,
    imageUrl,
    priceText,
    priceKzt: parsePriceToKzt(priceText),
    sourceUrl: productUrl || sourceUrl,
    originCountry: marketplaceOrigins[marketplace],
  };
}

function extractImageUrl(value: unknown) {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.url === "string") return value.url;
  return "";
}

function parsePriceToKzt(value?: string) {
  if (!value) return undefined;

  const amount = parseNumber(value.replace(/[^\d.,]/g, ""));
  if (!amount) return undefined;

  if (/[$]|USD/i.test(value)) {
    return Math.round((amount * USD_TO_KZT) / 100) * 100;
  }

  if (/EUR|€/i.test(value)) {
    return Math.round((amount * EUR_TO_KZT) / 100) * 100;
  }

  return Math.round(amount);
}

function parseNumber(value?: string) {
  if (!value) return undefined;

  const cleaned = value
    .replace(/\s/g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  const normalized =
    parts.length > 2
      ? `${parts.slice(0, -1).join("")}.${parts.at(-1)}`
      : cleaned;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseReviews(block: string) {
  const labels = Array.from(block.matchAll(/aria-label=["']([^"']+)["']/gi))
    .map((match) => match[1])
    .map((value) => Number(value.replace(/[^\d]/g, "")))
    .filter((value) => Number.isFinite(value) && value > 5);

  return labels[0];
}

function uniqueOffers(offers: ParsedMarketplaceOffer[]) {
  const seen = new Set<string>();

  return offers.filter((offer) => {
    const key = `${offer.sourceUrl}|${offer.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function metaContent(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const meta = html.match(
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
  );

  return meta ? decodeHtml(meta[1]) : "";
}

function firstImage(html: string) {
  for (const match of html.matchAll(/<img[^>]*>/gi)) {
    const src = getAttribute(match[0], "src") || getAttribute(match[0], "data-src");
    if (looksLikeProductImage(src)) return src;
  }

  return "";
}

function looksLikeProductImage(value: string) {
  if (!value) return false;
  const lowered = value.toLowerCase();

  return (
    !lowered.startsWith("data:") &&
    !lowered.includes("sprite") &&
    !lowered.includes("logo") &&
    !lowered.includes("placeholder") &&
    !lowered.includes("ir.ebaystatic.com/rs/") &&
    !lowered.endsWith(".svg")
  );
}

function firstUsableImageFromTag(tag: string, baseUrl: string) {
  const candidates = [
    getAttribute(tag, "src"),
    getAttribute(tag, "data-src"),
    getAttribute(tag, "data-lazy"),
    getAttribute(tag, "data-defer-load"),
  ]
    .map((value) => normalizeUrl(value, baseUrl))
    .filter(looksLikeProductImage);

  return candidates[0] ?? "";
}

function normalizeUrl(value: string, baseUrl: string) {
  if (!value) return "";

  try {
    if (value.startsWith("//")) {
      const protocol = new URL(baseUrl).protocol;
      return `${protocol}${value}`;
    }

    return new URL(decodeHtml(value), baseUrl).toString();
  } catch {
    return "";
  }
}

function getAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function matchFirst(value: string, regex: RegExp) {
  return value.match(regex)?.[1] ?? "";
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "));
}

function cleanText(value: string) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function safeHost(url: string) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}

function slugFromUrl(value: string) {
  try {
    return new URL(value).pathname.replace(/[^a-z0-9]+/gi, "-").slice(0, 64);
  } catch {
    return "item";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}
