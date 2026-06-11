import type { Marketplace } from "@/types/commerce";

export function formatKzt(value: number) {
  return new Intl.NumberFormat("ru-KZ", {
    currency: "KZT",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function getSavingsPercent(retailPrice: number, groupPrice: number) {
  if (retailPrice <= 0) return 0;
  return Math.max(0, Math.round(((retailPrice - groupPrice) / retailPrice) * 100));
}

const marketplaceColors: Record<Marketplace, string> = {
  Amazon: "#ff9900",
  AliExpress: "#ff4747",
  Alibaba: "#ff6a00",
  Trendyol: "#f27a1a",
  Temu: "#fb7701",
  eBay: "#e53238",
  Shein: "#e11d48",
  Ozon: "#005bff",
};

export function getMarketplaceColor(marketplace: Marketplace): string {
  return marketplaceColors[marketplace] ?? "#2388c9";
}
