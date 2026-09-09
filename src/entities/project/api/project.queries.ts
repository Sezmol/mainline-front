import {
  projectsControllerByIdOptions,
  projectsControllerByIdQueryKey,
  projectsControllerColumnsOptions,
  projectsControllerColumnsQueryKey,
  projectsControllerListOptions,
  projectsControllerListQueryKey,
} from "@shared/api";

export const projectKeys = {
  mine: (teamId?: string) =>
    projectsControllerListQueryKey({ query: teamId ? { teamId } : {} }),
  lists: () => [{ _id: "projectsControllerList" }] as const,
  byId: (projectId: string) =>
    projectsControllerByIdQueryKey({ path: { projectId } }),
  details: () => [{ _id: "projectsControllerById" }] as const,
  columns: (projectId: string) =>
    projectsControllerColumnsQueryKey({ path: { projectId } }),
};

export const projectQueries = {
  mine: (teamId?: string) =>
    projectsControllerListOptions({ query: teamId ? { teamId } : {} }),
  byId: (projectId: string) =>
    projectsControllerByIdOptions({ path: { projectId } }),
  columns: (projectId: string) =>
    projectsControllerColumnsOptions({ path: { projectId } }),
};
