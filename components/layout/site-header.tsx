import Link from "next/link";
import {
  Headphones,
  Home,
  Laptop,
  Play,
  Search,
  Smartphone,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/#feed", label: "Лента", icon: Play },
  { href: "/search#iphone", label: "iPhone", icon: Smartphone },
  { href: "/search#airpods", label: "AirPods", icon: Headphones },
  { href: "/search#macbook", label: "MacBook", icon: Laptop },
  { href: "/search", label: "Каталог", icon: Search },
  { href: "/#upload", label: "Продать", icon: UploadCloud },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-3 rounded-full border border-white/70 bg-white/76 px-3 shadow-[0_14px_42px_rgba(20,93,140,0.14)] backdrop-blur-xl sm:px-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-content text-sm font-bold text-white">
            C
          </span>
          <span className="hidden text-base font-semibold text-content sm:inline">
            CoiNIS
          </span>
        </Link>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-content-secondary",
                  "transition-colors hover:bg-content hover:text-white",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
