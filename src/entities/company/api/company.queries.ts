import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  companiesControllerAvailability,
  companiesControllerBySlugOptions,
  companiesControllerBySlugQueryKey,
  companiesControllerListInfiniteOptions,
  companiesControllerListInfiniteQueryKey,
  companiesControllerMineOptions,
  companiesControllerMineQueryKey,
  membersControllerListInfiniteOptions,
  membersControllerListInfiniteQueryKey,
} from "@shared/api";

const PAGE_SIZE = 20;

const normalize = (slug: string) => slug.toLowerCase();

export const companyKeys = {
  root: ["companies"] as const,

  page: (slug: string) =>
    companiesControllerBySlugQueryKey({ path: { slug: normalize(slug) } }),
  pages: () => [{ _id: "companiesControllerBySlug" }] as const,

  directory: (search?: string) =>
    companiesControllerListInfiniteQueryKey({
      query: { ...(search ? { q: search } : {}), limit: PAGE_SIZE },
    }),
  directories: () => [{ _id: "companiesControllerList" }] as const,

  mine: () => companiesControllerMineQueryKey(),

  members: (companyId: string) =>
    membersControllerListInfiniteQueryKey({
      path: { companyId },
      query: { limit: PAGE_SIZE },
    }),

  availability: (slug: string) =>
    [...companyKeys.root, "availability", normalize(slug)] as const,
};

export const companyQueries = {
  page: (slug: string) =>
    companiesControllerBySlugOptions({ path: { slug: normalize(slug) } }),

  directory: (search?: string) =>
    infiniteQueryOptions({
      ...companiesControllerListInfiniteOptions({
        query: { ...(search ? { q: search } : {}), limit: PAGE_SIZE },
      }),
      initialPageParam: { query: {} },
      getNextPageParam: (last) =>
        last.nextCursor ? { query: { cursor: last.nextCursor } } : undefined,
    }),

  mine: () => companiesControllerMineOptions(),

  members: (companyId: string) =>
    infiniteQueryOptions({
      ...membersControllerListInfiniteOptions({
        path: { companyId },
        query: { limit: PAGE_SIZE },
      }),
      initialPageParam: { path: { companyId }, query: {} },
      getNextPageParam: (last) =>
        last.nextCursor
          ? { path: { companyId }, query: { cursor: last.nextCursor } }
          : undefined,
    }),

  availability: (slug: string) =>
    queryOptions({
      queryKey: companyKeys.availability(slug),
      queryFn: async ({ signal }) => {
        const { data } = await companiesControllerAvailability({
          query: { slug: normalize(slug) },
          signal,
          throwOnError: true,
        });
        return data;
      },
      enabled: slug.length >= 3,
      staleTime: 30_000,
    }),
};
