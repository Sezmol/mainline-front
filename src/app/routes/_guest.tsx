import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ThemeSwitch } from "@features/theme/switch";

import { loadSession } from "@entities/session";

const GuestLayout = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
    <div className="w-full max-w-md">
      <p className="mb-8 text-center font-mono text-lg font-bold tracking-tight">
        <span className="text-primary-ink">$ </span>mainline
      </p>
      <div className="border-border bg-card rounded-lg border p-6 sm:p-8">
        <Outlet />
      </div>

      <ThemeSwitch className="mt-6 justify-center" />
    </div>
  </div>
);

export const Route = createFileRoute("/_guest")({
  beforeLoad: async ({ context }) => {
    const session = await loadSession(context.queryClient);

    if (session) {
      throw redirect({ to: "/feed" });
    }
  },
  component: GuestLayout,
});
