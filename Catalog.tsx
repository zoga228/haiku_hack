import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ProductHighlightCard } from "@/components/custom/ProductHighlightCard";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Star, ExternalLink, Flame, Share2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Catalog() {
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = trpc.products.search.useQuery({ query: search });

  const isShowingRecommendations = !search || search.trim() === "";

  return (
    <DashboardLayout requireAuth={false}>
      {/* Облачный фон */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        {/* Облака */}
        <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-10" viewBox="0 0 1200 600" preserveAspectRatio="none">
          <defs>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
          </defs>
          
          {/* Облако 1 */}
          <motion.g
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            filter="url(#blur)"
          >
            <ellipse cx="150" cy="100" rx="120" ry="50" fill="currentColor" className="text-blue-300" opacity="0.6" />
            <ellipse cx="220" cy="110" rx="100" ry="45" fill="currentColor" className="text-blue-300" opacity="0.5" />
            <ellipse cx="100" cy="120" rx="90" ry="40" fill="currentColor" className="text-blue-300" opacity="0.4" />
          </motion.g>

          {/* Облако 2 */}
          <motion.g
            animate={{ x: [-20, 0, -20] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            filter="url(#blur)"
          >
            <ellipse cx="900" cy="150" rx="130" ry="55" fill="currentColor" className="text-blue-200" opacity="0.5" />
            <ellipse cx="1000" cy="160" rx="110" ry="50" fill="currentColor" className="text-blue-200" opacity="0.4" />
            <ellipse cx="800" cy="170" rx="100" ry="45" fill="currentColor" className="text-blue-200" opacity="0.3" />
          </motion.g>

          {/* Облако 3 */}
          <motion.g
            animate={{ x: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            filter="url(#blur)"
          >
            <ellipse cx="400" cy="450" rx="140" ry="60" fill="currentColor" className="text-blue-300" opacity="0.4" />
            <ellipse cx="500" cy="460" rx="120" ry="55" fill="currentColor" className="text-blue-300" opacity="0.35" />
            <ellipse cx="300" cy="470" rx="110" ry="50" fill="currentColor" className="text-blue-300" opacity="0.3" />
          </motion.g>
        </svg>

        {/* Дополнительные облака через CSS */}
        <div className="absolute top-20 left-10 w-64 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-20 w-80 h-40 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-36 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 flex flex-col gap-8 max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Каталог товаров</h1>
          <p className="text-muted-foreground">
            {isShowingRecommendations 
              ? "Рекомендованные товары для вас" 
              : `Результаты поиска для "${search}"`}
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск товаров (например: iPhone 15 Pro)..."
            className="pl-10 h-12 rounded-full border-muted-foreground/20 focus-visible:ring-primary bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isShowingRecommendations && (
          <div className="flex items-center gap-2 text-orange-500 font-semibold text-lg">
            <Flame className="w-5 h-5 fill-current" />
            <h2>Популярное сейчас</h2>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[380px] w-full rounded-2xl bg-muted/50 animate-pulse backdrop-blur-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
            {products?.map((product: any, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <ProductHighlightCard
                  category={`${product.price} ${product.currency}`}
                  categoryIcon={<ShoppingBag className="w-4 h-4" />}
                  title={product.title}
                  description={
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {product.rating && (
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs ml-1 font-medium">{product.rating} ({product.num_ratings})</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <a 
                          href={product.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Детали <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => {
                            window.location.href = "/friends";
                            toast.info("Выберите друга в чате, чтобы отправить товар!");
                          }}
                          className="flex items-center justify-center gap-1 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  }
                  imageSrc={product.image}
                  imageAlt={product.title}
                />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && products?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium">Ничего не найдено</p>
            <p className="text-muted-foreground">Попробуйте изменить запрос поиска.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
