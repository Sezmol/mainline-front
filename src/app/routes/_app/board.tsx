import { createFileRoute } from "@tanstack/react-router";

import { BoardPage, boardSearchSchema } from "@pages/board";

import { projectQueries } from "@entities/project";

export const Route = createFileRoute("/_app/board")({
  staticData: { wide: true },
  validateSearch: boardSearchSchema,
  loader: ({ context }) => context.queryClient.query(projectQueries.mine()),
  component: BoardPage,
});
