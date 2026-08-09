import Logo from "@/components/ui/logo";

export const metadata = {
  title: "Dashboard",
  description: "Your Agentify workspace.",
};

/**
 * Placeholder for `DEFAULT_AUTH_REDIRECT` — where `proxy.ts` sends a signed-in
 * visitor. It exists so a successful login lands somewhere real; the actual
 * workspace has not been built yet.
 */
export default function Dashboard() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo mode="landscape" size="xl" />
      <p className="text-sm text-muted-foreground">
        You&rsquo;re signed in. The dashboard is not built yet.
      </p>
    </main>
  );
}
