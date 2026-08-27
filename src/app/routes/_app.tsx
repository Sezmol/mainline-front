import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@app/layouts/app-shell";

import { loadSession } from "@entities/session";

const AppLayout = () => (
  <AppShell>
    <Outlet />
  </AppShell>
);

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context }) => {
    const session = await loadSession(context.queryClient);

    if (!session) {
      throw redirect({ to: "/login" });
    }

    return { session };
  },
  component: AppLayout,
});
