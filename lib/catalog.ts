import type { Category, MarketplaceVariant, Product } from "@/types/commerce";

export type ProductSort =
  | "price-asc"
  | "price-desc"
  | "wholesale-asc"
  | "wholesale-desc";

export function getLowestRetailVariant(product: Product) {
  return product.variants.reduce((best, variant) =>
    variant.priceKzt < best.priceKzt ? variant : best,
  );
}

export function getLowestWholesaleVariant(product: Product) {
  return product.variants.reduce((best, variant) =>
    variant.wholesalePriceKzt < best.wholesalePriceKzt ? variant : best,
  );
}

export function getVariantPriceRange(product: Product) {
  const prices = product.variants.map((variant) => variant.priceKzt);

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function getProductSearchText(product: Product) {
  return [
    product.name,
    product.category,
    product.subcategory,
    product.description,
    product.marketplace,
    ...product.tags,
    ...Object.values(product.specs),
    ...product.variants.map((variant) => variant.marketplace),
  ]
    .join(" ")
    .toLowerCase();
}

export function productMatchesQuery(product: Product, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return normalizedQuery
    .split(/\s+/)
    .every((token) => getProductSearchText(product).includes(token));
}

export function scoreProduct(product: Product, options: {
  query?: string;
  category?: Category | "All";
  subcategory?: string;
  budgetKzt?: number;
  searchHistory?: string[];
}) {
  let score = 0;
  const searchText = getProductSearchText(product);
  const query = options.query?.trim().toLowerCase();

  if (query) {
    for (const token of query.split(/\s+/)) {
      if (product.name.toLowerCase().includes(token)) {
        score += 6;
      }
      if (product.subcategory.toLowerCase().includes(token)) {
        score += 4;
      }
      if (searchText.includes(token)) {
        score += 2;
      }
    }
  }

  if (options.category && options.category !== "All" && product.category === options.category) {
    score += 4;
  }

  if (options.subcategory && product.subcategory === options.subcategory) {
    score += 3;
  }

  if (options.budgetKzt && product.retailPriceKzt <= options.budgetKzt) {
    score += 2;
  }

  if (product.currentParticipants / product.minParticipants > 0.75) {
    score += 1;
  }

  for (const historyItem of options.searchHistory ?? []) {
    const normalizedHistoryItem = historyItem.toLowerCase();
    if (normalizedHistoryItem && searchText.includes(normalizedHistoryItem)) {
      score += 2;
    }
  }

  return score;
}

export function sortProducts(
  products: Product[],
  sort: ProductSort,
) {
  return [...products].sort((a, b) => {
    if (sort === "price-asc") {
      return a.retailPriceKzt - b.retailPriceKzt;
    }

    if (sort === "price-desc") {
      return b.retailPriceKzt - a.retailPriceKzt;
    }

    if (sort === "wholesale-asc") {
      return a.groupPriceKzt - b.groupPriceKzt;
    }

    if (sort === "wholesale-desc") {
      return b.groupPriceKzt - a.groupPriceKzt;
    }

    return a.retailPriceKzt - b.retailPriceKzt;
  });
}

export function sortVariants(
  variants: MarketplaceVariant[],
  sort: "price-asc" | "price-desc" | "wholesale-asc" | "wholesale-desc",
) {
  return [...variants].sort((a, b) => {
    if (sort === "price-asc") {
      return a.priceKzt - b.priceKzt;
    }

    if (sort === "price-desc") {
      return b.priceKzt - a.priceKzt;
    }

    if (sort === "wholesale-asc") {
      return a.wholesalePriceKzt - b.wholesalePriceKzt;
    }

    return b.wholesalePriceKzt - a.wholesalePriceKzt;
  });
}

export function getSubcategories(products: Product[], category: Category | "All") {
  const values = products
    .filter((product) => category === "All" || product.category === category)
    .map((product) => product.subcategory);

  return Array.from(new Set(values)).sort();
}
