import type { Metadata } from "next";
import { ProductSearch } from "@/components/product-search";

export const metadata: Metadata = {
  title: "Live поиск товаров — LocalBazaar",
  description:
    "Live поиск товаров по маркетплейсам через Bright Data с групповой покупкой.",
};

export default function SearchPage() {
  return <ProductSearch />;
}
