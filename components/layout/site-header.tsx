import Link from "next/link";
import { Play, Search, ShoppingBag, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/#feed", label: "Лента", icon: Play },
  { href: "/#marketplace", label: "Маркет", icon: ShoppingBag },
  { href: "/#upload", label: "Загрузить", icon: UploadCloud },
  { href: "/search", label: "Каталог", icon: Search },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center">
            <svg
              aria-hidden="true"
              className="size-8 fill-white drop-shadow"
              viewBox="0 0 256 256"
            >
              <path d="M0 128c70.692 0 128 57.308 128 128H64c0-35.346-28.654-64-64-64zm256 64c-35.346 0-64 28.654-64 64h-64c0-70.692 57.308-128 128-128zM128 0C128 70.692 70.692 128 0 128V64c35.346 0 64-28.654 64-64zm64 0c0 35.346 28.654 64 64 64v64C185.308 128 128 70.692 128 0z" />
            </svg>
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="text-sm font-semibold text-white drop-shadow">
              CoiNIS
            </p>
            <p className="text-[11px] text-white/65">
              Shop together. Save more.
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto rounded-full border border-white/25 bg-white/10 p-1 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/75",
                  "whitespace-nowrap transition-colors duration-150 hover:bg-white/15 hover:text-white sm:px-4",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
