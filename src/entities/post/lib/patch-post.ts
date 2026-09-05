import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { postKeys } from "../api";
import type { Post, PostPage } from "../post.types";

export const patchPost = (
  queryClient: QueryClient,
  id: string,
  update: (post: Post) => Post,
) => {
  queryClient.setQueriesData<InfiniteData<PostPage>>(
    { queryKey: postKeys.all() },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((post) =>
            post.id === id ? update(post) : post,
          ),
        })),
      },
  );

  queryClient.setQueryData<Post>(
    postKeys.byId(id),
    (post) => post && update(post),
  );
};

export const findPost = (queryClient: QueryClient, id: string) =>
  queryClient
    .getQueriesData<InfiniteData<PostPage>>({ queryKey: postKeys.all() })
    .flatMap(([, data]) => data?.pages ?? [])
    .flatMap((page) => page.items)
    .find((post) => post.id === id) ??
  queryClient.getQueryData<Post>(postKeys.byId(id));
