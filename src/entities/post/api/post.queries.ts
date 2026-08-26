import { infiniteQueryOptions } from "@tanstack/react-query";

import {
  postsControllerByIdOptions,
  postsControllerListInfiniteOptions,
  postsControllerListInfiniteQueryKey,
} from "@shared/api";

import type { FeedFilters } from "../post.types";

const PAGE_SIZE = 20;

export const postKeys = {
  feed: (filters: FeedFilters = {}) =>
    postsControllerListInfiniteQueryKey({
      query: { ...filters, limit: PAGE_SIZE },
    }),
  all: () => [{ _id: "postsControllerList" }] as const,
};

export const postQueries = {
  feed: (filters: FeedFilters = {}) =>
    infiniteQueryOptions({
      ...postsControllerListInfiniteOptions({
        query: { ...filters, limit: PAGE_SIZE },
      }),
      initialPageParam: { query: {} },
      getNextPageParam: (last) =>
        last.nextCursor ? { query: { cursor: last.nextCursor } } : undefined,
    }),

  byId: (id: string) => postsControllerByIdOptions({ path: { id } }),
};
