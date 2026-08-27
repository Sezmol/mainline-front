import {
  portfolioControllerByIdOptions,
  portfolioControllerByIdQueryKey,
  portfolioControllerListOptions,
  portfolioControllerListQueryKey,
} from "@shared/api";

export const projectKeys = {
  list: (userId: string) =>
    portfolioControllerListQueryKey({ path: { userId } }),
  lists: () => [{ _id: "portfolioControllerList" }] as const,
  byId: (userId: string, projectId: string) =>
    portfolioControllerByIdQueryKey({ path: { userId, projectId } }),
  details: () => [{ _id: "portfolioControllerById" }] as const,
};

export const projectQueries = {
  list: (userId: string) =>
    portfolioControllerListOptions({ path: { userId } }),
  byId: (userId: string, projectId: string) =>
    portfolioControllerByIdOptions({ path: { userId, projectId } }),
};
