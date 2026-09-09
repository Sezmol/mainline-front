import { createFileRoute, notFound } from "@tanstack/react-router";

import {
  ProjectNotFound,
  ProjectPage,
  ProjectPageSkeleton,
  projectSearchSchema,
} from "@pages/project";

import { projectQueries } from "@entities/project";

import { ApiError } from "@shared/api";

export const Route = createFileRoute("/_app/pr/$projectId")({
  staticData: { wide: true },
  validateSearch: projectSearchSchema,
  loader: async ({ context, params }) => {
    try {
      await Promise.all([
        context.queryClient.query(projectQueries.byId(params.projectId)),
        context.queryClient.query(projectQueries.columns(params.projectId)),
      ]);
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
  component: ProjectPage,
  pendingComponent: ProjectPageSkeleton,
  notFoundComponent: ProjectNotFound,
});
