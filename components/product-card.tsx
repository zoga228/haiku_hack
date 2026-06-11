import Link from "next/link";
import { Star, TrendingDown, UsersRound } from "lucide-react";
import { Badge, MarketplaceBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLowestRetailVariant, getVariantPriceRange } from "@/lib/catalog";
import { formatKzt, getMarketplaceColor, getSavingsPercent } from "@/lib/format";
import type { Product } from "@/types/commerce";

type ProductCardProps = {
  compact?: boolean;
  index?: number;
  onSelect?: (product: Product) => void;
  product: Product;
  selected?: boolean;
};

export function ProductCard({
  compact = false,
  index = 0,
  onSelect,
  product,
  selected = false,
}: ProductCardProps) {
  const lowestVariant = getLowestRetailVariant(product);
  const priceRange = getVariantPriceRange(product);
  const imageUrl = lowestVariant.imageUrl || product.imageUrl;
  const savings = getSavingsPercent(priceRange.min, product.groupPriceKzt);

  const content = (
    <Card
      className={`group flex h-full flex-col overflow-hidden p-0 text-left transition hover-lift ${
        selected ? "ring-2 ring-accent/35" : ""
      }`}
    >
      <div className="img-zoom relative aspect-[4/3] bg-white/45">
        <img
          alt={product.name}
          className="h-full w-full object-cover"
          src={imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/82 via-white/8 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <MarketplaceBadge
            color={getMarketplaceColor(lowestVariant.marketplace)}
            marketplace={lowestVariant.marketplace}
          />
        </div>
        {savings > 0 ? (
          <div className="absolute right-3 top-3">
            <Badge variant="success">
              <TrendingDown className="mr-1 size-3" />
              -{savings}%
            </Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge>{product.category}</Badge>
            <Badge variant="outline">{product.subcategory}</Badge>
          </div>
          <h3 className="line-clamp-2 font-semibold leading-snug text-content sm:text-lg">
            {product.name}
          </h3>
        </div>
        {!compact ? (
          <p className="line-clamp-2 text-sm leading-6 text-content-secondary">
            {product.description}
          </p>
        ) : null}
        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="mb-1 text-xs text-content-tertiary">
                Групповая цена
              </p>
              <p className="text-xl font-bold text-success">
                {formatKzt(product.groupPriceKzt)}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-xs text-content-tertiary">Цена</p>
              <p className="text-sm text-content-secondary">
                {formatKzt(priceRange.min)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-content-secondary">
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-warning text-warning" />
              {product.rating}
            </span>
            <span>{product.variants.length} предложений</span>
          </div>
          {onSelect ? (
            <div className="grid gap-2 rounded-lg border border-white/70 bg-white/35 px-3 py-2 text-xs text-content-secondary sm:grid-cols-2">
              <span>Открыть описание</span>
              <span className="flex items-center gap-1 sm:justify-end">
                <UsersRound className="size-3.5" />
                Групповая покупка
              </span>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <Link className={buttonClasses("primary")} href="/search">
                Подробнее
              </Link>
              <Link className={buttonClasses("secondary")} href="/groups">
                <UsersRound className="mr-1.5 size-4" />
                Групповая
              </Link>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (onSelect) {
    return (
      <button
        className="block h-full w-full animate-fade-in-up opacity-0"
        onClick={() => onSelect(product)}
        style={{ animationDelay: `${index * 0.06}s` }}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {content}
    </div>
  );
}
