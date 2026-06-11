import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";

const footerCategories = [
  { href: "/search#iphone", label: "iPhone" },
  { href: "/search#airpods", label: "AirPods" },
  { href: "/search#macbook", label: "MacBook" },
  { href: "/search#playstation", label: "PlayStation" },
];

const footerLinks = [
  { href: "/#feed", label: "Видео" },
  { href: "/search", label: "Каталог" },
  { href: "/#marketplace", label: "Поиск" },
  { href: "/#upload", label: "Загрузка" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="coinis-sky min-h-screen">
      <SiteHeader />
      <div className="relative z-10 mx-auto min-h-screen max-w-page px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        {children}
      </div>
      <footer className="relative z-10 border-t border-white/60 bg-white/58 backdrop-blur-xl">
        <div className="mx-auto grid max-w-page gap-8 px-4 py-10 sm:grid-cols-[1.5fr_1fr_1fr] sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-content text-sm font-bold text-white">
                C
              </span>
              <span className="text-lg font-semibold text-content">CoiNIS</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-content-secondary">
              Видео, товары и групповые покупки в одном месте.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-content">Категории</p>
            <div className="mt-3 grid gap-2">
              {footerCategories.map((item) => (
                <Link
                  className="text-sm text-content-secondary transition hover:text-content"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-content">Разделы</p>
            <div className="mt-3 grid gap-2">
              {footerLinks.map((item) => (
                <Link
                  className="text-sm text-content-secondary transition hover:text-content"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/60 px-4 py-4 text-center text-xs text-content-tertiary">
          CoiNIS 2026
        </div>
      </footer>
    </div>
  );
}
