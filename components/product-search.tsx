"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ExternalLink,
  Globe,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { GroupPurchasePanel } from "@/components/group-purchase-panel";
import { MarketplaceVariants } from "@/components/marketplace-variants";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";
import { Badge, MarketplaceBadge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLowestRetailVariant, ProductSort, sortProducts } from "@/lib/catalog";
import { scrapeMarketplaceProducts } from "@/lib/actions/scrape";
import { formatKzt, getMarketplaceColor } from "@/lib/format";
import type { Marketplace, Product } from "@/types/commerce";

type LiveCategory = {
  description: string;
  label: string;
  query: string;
};

const searchStorageKey = "coinis-live-search-history";
const inputClasses =
  "min-h-12 w-full rounded-full border border-white/70 bg-white/60 py-3 pl-11 pr-4 text-content placeholder:text-content-tertiary outline-none transition focus:border-accent/40 focus:bg-white";

const liveCategories: LiveCategory[] = [
  {
    label: "iPhone",
    query: "iPhone 16 Pro",
    description: "Смартфоны Apple и аксессуары.",
  },
  {
    label: "AirPods",
    query: "AirPods Pro 2",
    description: "Наушники, кейсы, аудио.",
  },
  {
    label: "MacBook",
    query: "MacBook Air M3",
    description: "Ноутбуки и зарядки USB-C.",
  },
  {
    label: "PlayStation",
    query: "PlayStation 5 Slim",
    description: "Консоли, игры, геймпады.",
  },
  {
    label: "Dyson",
    query: "Dyson Airwrap",
    description: "Уход и техника для дома.",
  },
  {
    label: "Кроссовки",
    query: "Nike running sneakers",
    description: "Nike, Adidas, повседневная обувь.",
  },
  {
    label: "Камеры",
    query: "2K indoor security camera",
    description: "Домашние камеры и baby monitor.",
  },
  {
    label: "Офис",
    query: "portable monitor 15.6 inch",
    description: "Мониторы, кресла и рабочее место.",
  },
];

const hashSearchMap: Record<string, string> = {
  airpods: "AirPods Pro 2",
  dyson: "Dyson Airwrap",
  iphone: "iPhone 16 Pro",
  macbook: "MacBook Air M3",
  playstation: "PlayStation 5 Slim",
  sneakers: "Nike running sneakers",
};

const marketplaceOptions: Marketplace[] = [
  "Amazon",
  "AliExpress",
  "Alibaba",
  "eBay",
  "Temu",
  "Trendyol",
  "Shein",
  "Ozon",
];

const defaultMarketplaces: Marketplace[] = [
  "Amazon",
  "AliExpress",
  "Alibaba",
  "eBay",
];

export function ProductSearch() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [sort, setSort] = useState<ProductSort>("price-asc");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] =
    useState<Marketplace[]>(defaultMarketplaces);
  const [isLoading, setIsLoading] = useState(false);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastSearch, setLastSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(searchStorageKey);
    if (saved) {
      setSearchHistory(JSON.parse(saved) as string[]);
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "").trim().toLowerCase();
    if (!hash) return;

    const decodedHash = decodeURIComponent(hash);
    const hashQuery =
      hashSearchMap[decodedHash] ||
      decodedHash.replace(/-/g, " ").replace(/\s+/g, " ").trim();

    if (!hashQuery) return;

    setQuery(hashQuery);
    void runLiveSearch(hashQuery);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(searchStorageKey, JSON.stringify(searchHistory));
  }, [searchHistory]);

  const visibleProducts = useMemo(
    () => sortProducts(liveProducts, sort),
    [liveProducts, sort],
  );

  function saveSearch(value: string) {
    const normalized = value.trim();
    if (!normalized) return;

    setSearchHistory((current) =>
      [normalized, ...current.filter((item) => item !== normalized)].slice(0, 8),
    );
  }

  async function runLiveSearch(value: string, categoryLabel = "") {
    const normalized = value.trim();
    if (!normalized || selectedMarketplaces.length === 0) return;

    setIsLoading(true);
    setError("");
    setLastSearch(normalized);
    setActiveCategory(categoryLabel);
    setSelectedProduct(null);
    saveSearch(normalized);

    try {
      const results = await scrapeMarketplaceProducts(
        normalized,
        selectedMarketplaces,
      );
      setLiveProducts(results);
      setSelectedProduct(results[0] ?? null);

      if (results.length === 0) {
        setError(
          "Live-поиск не вернул товары. Попробуйте другой запрос или маркетплейс.",
        );
      }
    } catch (nextError) {
      console.error("Live search failed:", nextError);
      setLiveProducts([]);
      setError("Не удалось получить live-товары через Bright Data.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runLiveSearch(query);
  }

  function handleCategoryClick(category: LiveCategory) {
    setQuery(category.query);
    void runLiveSearch(category.query, category.label);
  }

  function toggleMarketplace(marketplace: Marketplace) {
    setSelectedMarketplaces((current) =>
      current.includes(marketplace)
        ? current.filter((item) => item !== marketplace)
        : [...current, marketplace],
    );
  }

  return (
    <main className="space-y-8">
      <section className="mx-auto max-w-4xl pt-6 text-center text-white">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Каталог
        </h1>
      </section>

      <Card className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader eyebrow="Поиск" title="Что ищем?" />
          <Badge variant="accent">
            <Globe className="mr-1.5 size-3" />
            Live
          </Badge>
        </div>

        <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" />
            <input
              className={inputClasses}
              disabled={isLoading}
              placeholder="iPhone, AirPods, MacBook..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <Button disabled={isLoading || !query.trim()} type="submit">
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Search className="mr-2 size-4" />
            )}
            Найти
          </Button>
        </form>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Популярное
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {liveCategories.map((category) => (
              <button
                className={`rounded-lg border p-3 text-left transition ${
                  activeCategory === category.label
                    ? "border-accent/35 bg-accent/10"
                    : "border-white/70 bg-white/30 hover:bg-white/55"
                }`}
                disabled={isLoading}
                key={category.label}
                onClick={() => handleCategoryClick(category)}
                type="button"
              >
                <span className="font-semibold text-content">{category.label}</span>
                <span className="mt-1 block text-xs leading-5 text-content-secondary">
                  {category.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">
            Маркетплейсы Bright Data
          </p>
          <div className="flex flex-wrap gap-2">
            {marketplaceOptions.map((marketplace) => {
              const selected = selectedMarketplaces.includes(marketplace);

              return (
                <button
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    selected
                      ? "border-accent/30 bg-accent/10 text-accent-dark"
                      : "border-white/70 bg-white/30 text-content-secondary hover:bg-white/55"
                  }`}
                  key={marketplace}
                  onClick={() => toggleMarketplace(marketplace)}
                  type="button"
                >
                  {marketplace}
                </button>
              );
            })}
          </div>
        </div>

        {searchHistory.length > 0 && !isLoading ? (
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item) => (
              <button
                className="rounded-full border border-white/70 bg-white/35 px-3 py-1.5 text-xs text-content-secondary transition hover:bg-white/60 hover:text-content"
                key={item}
                onClick={() => {
                  setQuery(item);
                  void runLiveSearch(item);
                }}
                type="button"
              >
                {item}
              </button>
            ))}
            <button
              className="inline-flex items-center rounded-full border border-white/70 bg-white/25 px-3 py-1.5 text-xs text-content-tertiary transition hover:bg-white/60 hover:text-content"
              onClick={() => setSearchHistory([])}
              type="button"
            >
              <X className="mr-1 size-3" />
              Очистить
            </button>
          </div>
        ) : null}
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <Card className="grid gap-3 md:grid-cols-[1fr_220px] md:items-end">
            <SectionHeader
              eyebrow={lastSearch ? lastSearch : "Результаты"}
              title={isLoading ? "Ищем..." : `${visibleProducts.length} товаров`}
            />
            <label className="grid gap-2 text-sm font-medium text-content-secondary">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4" />
                Сортировка
              </span>
              <select
                className="min-h-11 rounded-lg border border-white/70 bg-white/55 px-4 py-3 text-content outline-none transition focus:border-accent/40 focus:bg-white"
                value={sort}
                onChange={(event) => setSort(event.target.value as ProductSort)}
              >
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="wholesale-asc">Групповая: дешевле</option>
                <option value="wholesale-desc">Групповая: дороже</option>
              </select>
            </label>
          </Card>

          {error ? (
            <Card>
              <p className="text-sm text-content-secondary">{error}</p>
            </Card>
          ) : null}

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="h-96 animate-pulse bg-white/45" />
              ))}
            </div>
          ) : visibleProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  index={index}
                  key={product.id}
                  product={product}
                  selected={selectedProduct?.id === product.id}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-sm text-content-secondary">
                Выберите категорию или введите запрос.
              </p>
            </Card>
          )}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <LiveProductDetails product={selectedProduct} />
          <GroupPurchasePanel product={selectedProduct} />
        </aside>
      </section>
    </main>
  );
}

function LiveProductDetails({ product }: { product: Product | null }) {
  if (!product) {
    return (
      <Card className="space-y-3">
        <Badge variant="outline">Описание</Badge>
        <h2 className="text-xl font-semibold text-content">
          Выберите live-карточку
        </h2>
        <p className="text-sm leading-6 text-content-secondary">
          Описание товара, цена, ссылка на маркетплейс и групповая покупка
          откроются здесь, без перехода на отдельную страницу.
        </p>
      </Card>
    );
  }

  const primaryVariant = getLowestRetailVariant(product);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <img
          alt={product.name}
          className="aspect-[4/3] w-full object-cover"
          src={primaryVariant.imageUrl}
        />
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            <MarketplaceBadge
              color={getMarketplaceColor(primaryVariant.marketplace)}
              marketplace={primaryVariant.marketplace}
            />
            <Badge>{product.category}</Badge>
          </div>
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-content">
              {product.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-content-secondary">
              {product.description}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/70 bg-white/35 p-3">
              <p className="text-xs text-content-tertiary">Цена</p>
              <p className="text-lg font-semibold text-content">
                {formatKzt(product.retailPriceKzt)}
              </p>
            </div>
            <div className="rounded-lg border border-success/20 bg-success/10 p-3">
              <p className="text-xs text-content-tertiary">Групповая цена</p>
              <p className="text-lg font-semibold text-success">
                {formatKzt(product.groupPriceKzt)}
              </p>
            </div>
          </div>
          <a
            className={buttonClasses("primary")}
            href={primaryVariant.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="mr-1.5 size-4" />
            Открыть товар на {primaryVariant.marketplace}
          </a>
        </div>
      </Card>
      <MarketplaceVariants product={product} />
    </div>
  );
}
