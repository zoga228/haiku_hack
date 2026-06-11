import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-bold gradient-text">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-content">
        Страница не найдена
      </h1>
      <p className="mt-2 text-content-secondary">
        Такой страницы не существует. Возможно, товар был удалён.
      </p>
      <Link href="/" className={`${buttonClasses("primary")} mt-6`}>
        <ArrowLeft className="mr-2 size-4" />
        На главную
      </Link>
    </main>
  );
}
