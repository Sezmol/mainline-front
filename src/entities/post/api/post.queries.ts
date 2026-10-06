import { infiniteQueryOptions } from "@tanstack/react-query";

import {
  interactionsControllerListOptions,
  interactionsControllerListQueryKey,
  postsControllerByIdOptions,
  postsControllerByIdQueryKey,
  postsControllerLikesInfiniteOptions,
  postsControllerLikesInfiniteQueryKey,
  postsControllerListInfiniteOptions,
  postsControllerListInfiniteQueryKey,
} from "@shared/api";

import type { FeedFilters } from "../post.types";

const PAGE_SIZE = 20;
const LIKES_PAGE_SIZE = 20;

export const postKeys = {
  feed: (filters: FeedFilters = {}) =>
    postsControllerListInfiniteQueryKey({
      query: { ...filters, limit: PAGE_SIZE },
    }),
  all: () => [{ _id: "postsControllerList" }] as const,
  byId: (id: string) => postsControllerByIdQueryKey({ path: { id } }),
  details: () => [{ _id: "postsControllerById" }] as const,
  interactions: (id: string) =>
    interactionsControllerListQueryKey({ path: { id } }),
  likes: (id: string) =>
    postsControllerLikesInfiniteQueryKey({
      path: { id },
      query: { limit: LIKES_PAGE_SIZE },
    }),
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

  interactions: (id: string) =>
    interactionsControllerListOptions({ path: { id } }),

  likes: (id: string) =>
    infiniteQueryOptions({
      ...postsControllerLikesInfiniteOptions({
        path: { id },
        query: { limit: LIKES_PAGE_SIZE },
      }),
      initialPageParam: { path: { id }, query: {} },
      getNextPageParam: (last) =>
        last.nextCursor
          ? { path: { id }, query: { cursor: last.nextCursor } }
          : undefined,
    }),
};
