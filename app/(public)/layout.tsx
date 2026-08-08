import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Routes } from "@/lib/constants";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link href={Routes.HOME} className="font-heading text-base font-semibold uppercase tracking-widest">
          Agentify
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}