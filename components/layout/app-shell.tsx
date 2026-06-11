import { SiteHeader } from "@/components/layout/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto min-h-screen max-w-page px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </div>
      <footer className="border-t border-white/[0.06] bg-surface-card">
        <div className="mx-auto max-w-page px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-violet text-sm font-bold text-white">
                  LB
                </span>
                <span className="text-sm font-semibold text-content">
                  LocalBazaar
                </span>
              </div>
              <p className="mt-3 text-sm text-content-secondary">
                Live-поиск товаров по глобальным маркетплейсам и групповая
                покупка с друзьями.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-content-tertiary">
                Маркетплейсы
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-content-secondary">
                <span>Amazon</span>
                <span>/</span>
                <span>AliExpress</span>
                <span>/</span>
                <span>Alibaba</span>
                <span>/</span>
                <span>Temu</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-content-secondary">
                <span>Trendyol</span>
                <span>/</span>
                <span>eBay</span>
                <span>/</span>
                <span>Shein</span>
                <span>/</span>
                <span>Ozon</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-content-tertiary">
                Профиль
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-content-secondary">
                <span>Регистрация</span>
                <span>/</span>
                <span>Друзья</span>
                <span>/</span>
                <span>Групповая покупка</span>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/[0.06] pt-6 text-center text-xs text-content-tertiary">
            LocalBazaar MVP. Цены показаны в тенге (KZT).
          </div>
        </div>
      </footer>
    </>
  );
}
