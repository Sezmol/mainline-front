import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProjectNotFound, ProjectPage } from "@pages/project";

import { projectQueries } from "@entities/project";
import { userQueries } from "@entities/user";

import { ApiError } from "@shared/api";

export const Route = createFileRoute("/_app/u/$nickname_/projects/$projectId")({
  loader: async ({ context, params }) => {
    try {
      const profile = await context.queryClient.query({
        ...userQueries.profile(params.nickname),
        staleTime: "static",
      });

      await context.queryClient.query({
        ...projectQueries.byId(profile.id, params.projectId),
        staleTime: "static",
      });

      return { userId: profile.id };
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
  component: ProjectPage,
  notFoundComponent: ProjectNotFound,
});
