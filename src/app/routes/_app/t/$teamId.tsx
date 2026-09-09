import { createFileRoute, notFound } from "@tanstack/react-router";

import { TeamNotFound, TeamPage } from "@pages/team";

import { teamQueries } from "@entities/team";

import { ApiError } from "@shared/api";

export const Route = createFileRoute("/_app/t/$teamId")({
  loader: async ({ context, params }) => {
    try {
      await Promise.all([
        context.queryClient.query(teamQueries.byId(params.teamId)),
        context.queryClient.query(teamQueries.members(params.teamId)),
      ]);
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
  component: TeamPage,
  notFoundComponent: TeamNotFound,
});
