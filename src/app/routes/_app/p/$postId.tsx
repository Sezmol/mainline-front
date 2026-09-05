import { createFileRoute, notFound } from "@tanstack/react-router";

import { PostNotFound, PostPage } from "@pages/post";

import { postQueries } from "@entities/post";

import { ApiError } from "@shared/api";

export const Route = createFileRoute("/_app/p/$postId")({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.query(postQueries.byId(params.postId));
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
  component: PostPage,
  notFoundComponent: PostNotFound,
});
