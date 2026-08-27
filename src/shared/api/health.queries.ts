import { queryOptions } from "@tanstack/react-query";

import { healthControllerCheck } from "./generated";

export const healthKeys = {
  root: ["health"] as const,
};

export const healthQueries = {
  status: () =>
    queryOptions({
      queryKey: healthKeys.root,
      queryFn: async ({ signal }) => {
        const { data } = await healthControllerCheck({
          signal,
          throwOnError: true,
        });
        return data;
      },
      refetchInterval: 15_000,
      retry: false,
    }),
};
