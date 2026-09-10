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
      queryFn: async () => {
        try {
          const { data } = await authControllerSession({ throwOnError: true });
          return data;
        } catch (error) {
          if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
            return null;
          }
          throw error;
        }
      },
      retry: 1,
      staleTime: 5 * 60_000,
    }),
};
