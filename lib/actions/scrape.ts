"use server";

import type { Marketplace, MarketplaceVariant, Product } from "@/types/commerce";
import {
  buildMarketplaceSearchUrl,
  fetchWithBrightData,
  parseMarketplaceOffers,
} from "@/lib/brightdata";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function scrapeAmazonProducts(query: string): Promise<Product[]> {
  return scrapeMarketplaceProducts(query, ["Amazon"]);
}

export async function scrapeMarketplaceProducts(
  query: string,
  marketplaces: Marketplace[] = ["Amazon", "AliExpress", "Alibaba", "eBay"],
): Promise<Product[]> {
  if (!query.trim()) return [];

  const uniqueMarketplaces = Array.from(new Set(marketplaces)).slice(0, 8);

  try {
    const settled = await Promise.allSettled(
      uniqueMarketplaces.map(async (marketplace) => {
        const searchUrl = buildMarketplaceSearchUrl(marketplace, query);
        const html = await fetchWithBrightData(searchUrl);

        return parseMarketplaceOffers(html, searchUrl, {
          query,
          limit: marketplace === "Amazon" ? 18 : 8,
        });
      }),
    );

    const parsedOffers = settled.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );

    return parsedOffers
      .filter((offer) => offer.priceKzt && offer.title && offer.imageUrl)
      .map((offer, index) => {
        const retailPriceKzt = offer.priceKzt ?? 0;
        const groupPriceKzt = Math.round((retailPriceKzt * 0.9) / 100) * 100;
        const id =
          offer.id || `bright-${offer.marketplace}-${slugify(offer.title)}-${index}`;

        const variant: MarketplaceVariant = {
          id,
          marketplace: offer.marketplace,
          title: offer.title,
          seller: "Bright Data live result",
          imageUrl: offer.imageUrl,
          priceKzt: retailPriceKzt,
          wholesalePriceKzt: groupPriceKzt,
          minWholesaleQty: 10,
          deliveryEstimate: "7-14 days",
          rating: offer.rating ?? 4.5,
          reviews: offer.reviews ?? 150,
          originCountry: offer.originCountry,
          sourceUrl: offer.sourceUrl,
        };

        return {
          id: `live-${id}`,
          name: offer.title,
          category: "Electronics",
          subcategory: "Live search",
          marketplace: offer.marketplace,
          originCountry: offer.originCountry,
          imageUrl: offer.imageUrl,
          description: "Live marketplace result parsed through Bright Data.",
          tags: ["live", "brightdata", "marketplace"],
          specs: { Query: query, Source: "Bright Data Web Unlocker" },
          variants: [variant],
          retailPriceKzt,
          groupPriceKzt,
          minParticipants: 10,
          currentParticipants: 1,
          deliveryEstimate: "7-14 days",
          rating: offer.rating ?? 4.5,
          paymentMethods: ["Card", "Kaspi"],
          localizedNote:
            "Prices are shown in KZT. External links open marketplace product pages.",
        } satisfies Product;
      });
  } catch (error) {
    console.error("Error fetching Bright Data live data:", error);
    return [];
  }
}
