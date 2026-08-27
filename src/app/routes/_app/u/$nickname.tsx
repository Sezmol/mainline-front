import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProfileNotFound, ProfilePage } from "@pages/profile";

import { projectQueries } from "@entities/project";
import { userQueries } from "@entities/user";

import { ApiError } from "@shared/api";

export const Route = createFileRoute("/_app/u/$nickname")({
  loader: async ({ context, params }) => {
    try {
      const profile = await context.queryClient.query({
        ...userQueries.profile(params.nickname),
        staleTime: "static",
      });

      await context.queryClient.query({
        ...projectQueries.list(profile.id),
        staleTime: "static",
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
  component: ProfilePage,
  notFoundComponent: ProfileNotFound,
});
