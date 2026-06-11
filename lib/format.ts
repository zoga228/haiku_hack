import type { Marketplace } from "@/types/commerce";

export function formatKzt(value: number) {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getSavingsPercent(retailPrice: number, groupPrice: number) {
  return Math.round(((retailPrice - groupPrice) / retailPrice) * 100);
}

const marketplaceColors: Record<Marketplace, string> = {
  Amazon: "#FF9900",
  AliExpress: "#FF4747",
  Alibaba: "#FF6A00",
  Trendyol: "#F27A1A",
  Temu: "#FB7701",
  eBay: "#E53238",
  Shein: "#E11D48",
  Ozon: "#005BFF",
};

export function getMarketplaceColor(marketplace: Marketplace): string {
  return marketplaceColors[marketplace] ?? "#6366f1";
}
