import Link from "next/link";
import { Search, Store, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Live поиск", icon: Store },
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/groups", label: "Групповая покупка", icon: UsersRound },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-violet text-sm font-bold text-white shadow-lg shadow-accent/20 transition-shadow group-hover:shadow-accent/40">
            LB
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="text-sm font-semibold text-content">LocalBazaar</p>
            <p className="text-[11px] text-content-tertiary">Live marketplace</p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-content-secondary",
                  "transition-all duration-200 hover:bg-white/[0.06] hover:text-content",
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
