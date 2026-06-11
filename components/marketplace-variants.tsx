"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { Badge, MarketplaceBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sortVariants } from "@/lib/catalog";
import { formatKzt, getMarketplaceColor } from "@/lib/format";
import type { Product } from "@/types/commerce";

type MarketplaceVariantsProps = {
  product: Product;
};

const selectClasses =
  "min-h-11 rounded-lg border border-white/70 bg-white/55 px-4 py-3 text-content outline-none transition focus:border-accent/40 focus:bg-white";

export function MarketplaceVariants({ product }: MarketplaceVariantsProps) {
  const [sort, setSort] = useState<
    "price-asc" | "price-desc" | "wholesale-asc" | "wholesale-desc"
  >("price-asc");

  const variants = useMemo(
    () => sortVariants(product.variants, sort),
    [product.variants, sort],
  );

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="accent">
            <ArrowUpDown className="mr-1.5 size-3" />
            {product.variants.length} предложений
          </Badge>
          <h2 className="mt-3 text-2xl font-semibold text-content">
            Сравнение предложений
          </h2>
          <p className="mt-2 text-sm leading-6 text-content-secondary">
            Откройте предложение на маркетплейсе или используйте его для
            групповой покупки.
          </p>
        </div>
        <label className="grid gap-2 text-sm font-medium text-content-secondary">
          Сортировка
          <select
            className={selectClasses}
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
          >
            <option value="price-asc">Цена: по возрастанию</option>
            <option value="price-desc">Цена: по убыванию</option>
            <option value="wholesale-asc">Групповая цена: по возрастанию</option>
            <option value="wholesale-desc">Групповая цена: по убыванию</option>
          </select>
        </label>
      </div>
      <div className="space-y-3">
        {variants.map((variant) => (
          <div
            className="group grid gap-4 rounded-lg border border-white/70 bg-white/38 p-4 transition hover:bg-white/58 sm:grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr_140px_160px_auto] lg:items-center"
            key={variant.id}
          >
            <div className="img-zoom overflow-hidden rounded-lg">
              <img
                alt={variant.title}
                className="aspect-square w-full object-cover sm:w-20"
                src={variant.imageUrl}
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <MarketplaceBadge
                  color={getMarketplaceColor(variant.marketplace)}
                  marketplace={variant.marketplace}
                />
                <Badge variant="outline">{variant.originCountry}</Badge>
              </div>
              <h3 className="mt-2 font-medium text-content">{variant.title}</h3>
              <p className="mt-1 text-xs text-content-tertiary">
                {variant.seller} / {variant.deliveryEstimate} / ★ {variant.rating} /{" "}
                {variant.reviews} отзывов
              </p>
            </div>
            <div>
              <p className="text-xs text-content-tertiary">Цена</p>
              <p className="text-lg font-semibold text-content">
                {formatKzt(variant.priceKzt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-content-tertiary">
                Группа от {variant.minWholesaleQty} шт.
              </p>
              <p className="text-lg font-semibold text-success">
                {formatKzt(variant.wholesalePriceKzt)}
              </p>
            </div>
            <a
              className={buttonClasses("secondary")}
              href={variant.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="mr-1.5 size-4" />
              Открыть
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
}
