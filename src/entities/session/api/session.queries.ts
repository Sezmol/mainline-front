import { queryOptions } from "@tanstack/react-query";

import { ApiError, authControllerSession } from "@shared/api";

export const sessionKeys = {
  root: ["session"] as const,
  current: () => [...sessionKeys.root, "current"] as const,
};

export const sessionQueries = {
  current: () =>
    queryOptions({
      queryKey: sessionKeys.current(),
      queryFn: async ({ signal }) => {
        try {
          const { data } = await authControllerSession({
            signal,
            throwOnError: true,
          });
          return data;
        } catch (error) {
          if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
            return null;
          }
          throw error;
        }
      },
      retry: false,
      staleTime: 5 * 60_000,
    }),
};
