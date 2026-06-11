import type { Metadata } from "next";
import { ProductSearch } from "@/components/product-search";

export const metadata: Metadata = {
  title: "Групповая покупка — LocalBazaar",
  description:
    "Создавайте групповые покупки с друзьями на основе live-товаров маркетплейсов.",
};

export default function GroupsPage() {
  return <ProductSearch />;
}
