import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CoiNIS — коллективные покупки и видео-маркетплейс",
  description:
    "CoiNIS объединяет Supabase-видео, live-поиск маркетплейсов, карточки товаров и групповые покупки.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
