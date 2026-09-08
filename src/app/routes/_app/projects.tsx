import { createFileRoute } from "@tanstack/react-router";

import { ProjectsPage } from "@pages/projects";

import { projectQueries } from "@entities/project";

export const Route = createFileRoute("/_app/projects")({
  loader: ({ context }) => context.queryClient.query(projectQueries.mine()),
  component: ProjectsPage,
});
