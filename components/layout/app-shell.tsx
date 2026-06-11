import { SiteHeader } from "@/components/layout/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="coinis-sky min-h-screen">
      <SiteHeader />
      <div className="relative z-10 mx-auto min-h-screen max-w-page px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        {children}
      </div>
      <footer className="relative z-10 border-t border-white/50 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-page px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-content shadow-sm">
              C
            </span>
            <span className="text-sm font-semibold text-content">CoiNIS</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-content-secondary">
            Единый MVP: Supabase-вход, TikTok-style лента, live-маркетплейс,
            загрузка видео и карточка товара под каждым роликом.
          </p>
        </div>
      </footer>
    </div>
  );
}
