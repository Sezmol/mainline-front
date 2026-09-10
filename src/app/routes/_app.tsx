import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@app/layouts/app-shell";
import { PagePending } from "@app/layouts/route-pending";

import { loadSession } from "@entities/session";

const AppLayout = () => (
  <AppShell>
    <Outlet />
  </AppShell>
);

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    const session = await loadSession(context.queryClient);

    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    return { session };
  },
  component: AppLayout,
  pendingComponent: PagePending,
});
