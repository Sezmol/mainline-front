import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { useReloadOnSessionSwitch } from "@app/model/use-reload-on-session-switch";

export interface RouterContext {
  queryClient: QueryClient;
}

const RootLayout = () => {
  useReloadOnSessionSwitch();

  return <Outlet />;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
