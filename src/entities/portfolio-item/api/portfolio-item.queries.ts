import {
  portfolioControllerByIdOptions,
  portfolioControllerByIdQueryKey,
  portfolioControllerListOptions,
  portfolioControllerListQueryKey,
} from "@shared/api";

export const portfolioItemKeys = {
  list: (userId: string) =>
    portfolioControllerListQueryKey({ path: { userId } }),
  lists: () => [{ _id: "portfolioControllerList" }] as const,
  byId: (userId: string, itemId: string) =>
    portfolioControllerByIdQueryKey({ path: { userId, itemId } }),
  details: () => [{ _id: "portfolioControllerById" }] as const,
};

export const portfolioItemQueries = {
  list: (userId: string) =>
    portfolioControllerListOptions({ path: { userId } }),

  byId: (userId: string, itemId: string) =>
    portfolioControllerByIdOptions({ path: { userId, itemId } }),
};
