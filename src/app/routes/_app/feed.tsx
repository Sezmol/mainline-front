import { createFileRoute } from "@tanstack/react-router";

import { FeedPage, feedSearchSchema } from "@pages/feed";

import { postQueries } from "@entities/post";

export const Route = createFileRoute("/_app/feed")({
  validateSearch: feedSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.infiniteQuery({
      ...postQueries.feed(deps),
      staleTime: "static",
    }),
  component: FeedPage,
});
