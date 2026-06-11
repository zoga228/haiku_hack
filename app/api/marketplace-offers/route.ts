import { NextResponse } from "next/server";
import type { Marketplace } from "@/types/commerce";
import {
  buildMarketplaceSearchUrl,
  fetchWithBrightData,
  parseMarketplaceOffers,
} from "@/lib/brightdata";

export const runtime = "nodejs";

const marketplaces: Marketplace[] = [
  "Amazon",
  "AliExpress",
  "Alibaba",
  "Trendyol",
  "Temu",
  "eBay",
  "Shein",
  "Ozon",
];

type ParsePayload = {
  url?: string;
  query?: string;
  marketplace?: Marketplace;
  marketplaces?: Marketplace[];
  limit?: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return handleParse({
    url: searchParams.get("url") ?? undefined,
    query: searchParams.get("query") ?? undefined,
    marketplace: toMarketplace(searchParams.get("marketplace")),
    marketplaces: toMarketplaces(searchParams.get("marketplaces")),
    limit: toLimit(searchParams.get("limit")),
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ParsePayload;
  return handleParse(payload);
}

async function handleParse(payload: ParsePayload) {
  const marketplace = payload.marketplace ?? "Amazon";
  const marketplaces = payload.marketplaces?.length
    ? payload.marketplaces
    : [marketplace];

  if (!payload.url && payload.query && marketplaces.length > 1) {
    try {
      const settled = await Promise.allSettled(
        marketplaces.map(async (item) => {
          const targetUrl = buildMarketplaceSearchUrl(item, payload.query ?? "");
          const html = await fetchWithBrightData(targetUrl);
          return parseMarketplaceOffers(html, targetUrl, {
            query: payload.query,
            limit: payload.limit,
          });
        }),
      );
      const offers = settled.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      );

      return NextResponse.json({
        sourceUrl: null,
        count: offers.length,
        offers,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Marketplace parsing failed",
        },
        { status: 500 },
      );
    }
  }

  const targetUrl =
    payload.url ??
    (payload.query ? buildMarketplaceSearchUrl(marketplace, payload.query) : "");

  if (!targetUrl || !isHttpUrl(targetUrl)) {
    return NextResponse.json(
      { error: "Provide a valid url or query" },
      { status: 400 },
    );
  }

  try {
    const html = await fetchWithBrightData(targetUrl);
    const offers = parseMarketplaceOffers(html, targetUrl, {
      query: payload.query,
      limit: payload.limit,
    });

    return NextResponse.json({
      sourceUrl: targetUrl,
      count: offers.length,
      offers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Marketplace parsing failed",
      },
      { status: 500 },
    );
  }
}

function toMarketplace(value: string | null): Marketplace | undefined {
  return marketplaces.find((marketplace) => marketplace === value);
}

function toMarketplaces(value: string | null): Marketplace[] | undefined {
  if (!value) return undefined;
  return value
    .split(",")
    .map((item) => toMarketplace(item.trim()))
    .filter((item): item is Marketplace => Boolean(item));
}

function toLimit(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
