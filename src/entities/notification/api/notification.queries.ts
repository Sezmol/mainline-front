import { infiniteQueryOptions } from "@tanstack/react-query";

import {
  notificationsControllerListInfiniteOptions,
  notificationsControllerListInfiniteQueryKey,
  notificationsControllerListOptions,
  notificationsControllerListQueryKey,
} from "@shared/api";

const PAGE_SIZE = 20;
const POLL_INTERVAL = 60_000;

export const notificationKeys = {
  all: () => [{ _id: "notificationsControllerList" }] as const,
  badge: () => notificationsControllerListQueryKey({ query: { limit: 1 } }),
  list: () =>
    notificationsControllerListInfiniteQueryKey({
      query: { limit: PAGE_SIZE },
    }),
};

export const notificationQueries = {
  badge: () => ({
    ...notificationsControllerListOptions({ query: { limit: 1 } }),
    refetchInterval: POLL_INTERVAL,
  }),

  list: () =>
    infiniteQueryOptions({
      ...notificationsControllerListInfiniteOptions({
        query: { limit: PAGE_SIZE },
      }),
      initialPageParam: { query: {} },
      getNextPageParam: (last) =>
        last.nextCursor ? { query: { cursor: last.nextCursor } } : undefined,
    }),
};
