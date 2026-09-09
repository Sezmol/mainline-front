import {
  teamsControllerByIdOptions,
  teamsControllerByIdQueryKey,
  teamsControllerListOptions,
  teamsControllerListQueryKey,
  teamsControllerMembersOptions,
  teamsControllerMembersQueryKey,
} from "@shared/api";

export const teamKeys = {
  mine: (companyId?: string) =>
    teamsControllerListQueryKey({ query: companyId ? { companyId } : {} }),
  lists: () => [{ _id: "teamsControllerList" }] as const,
  byId: (teamId: string) => teamsControllerByIdQueryKey({ path: { teamId } }),
  members: (teamId: string) =>
    teamsControllerMembersQueryKey({ path: { teamId } }),
};

export const teamQueries = {
  mine: (companyId?: string) =>
    teamsControllerListOptions({ query: companyId ? { companyId } : {} }),
  byId: (teamId: string) => teamsControllerByIdOptions({ path: { teamId } }),
  members: (teamId: string) =>
    teamsControllerMembersOptions({ path: { teamId } }),
};
