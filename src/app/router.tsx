import { createRouter } from "@tanstack/react-router";

import { RouteError } from "./layouts/route-error";
import { RouteNotFound } from "./layouts/route-not-found";
import { RoutePending } from "./layouts/route-pending";
import { queryClient } from "./providers/query-client";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: RouteNotFound,
  defaultPendingComponent: RoutePending,
  defaultPendingMs: 200,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }

  interface StaticDataRouteOption {
    wide?: boolean;
  }
}
