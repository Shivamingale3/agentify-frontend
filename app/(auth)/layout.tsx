import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,var(--primary)/18%,transparent_60%)]"
      />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <main className="w-full max-w-sm">{children}</main>
    </div>
  );
}