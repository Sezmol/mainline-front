import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { type Post, postKeys, type PostPage } from "@entities/post";

import { postsControllerLike, postsControllerUnlike } from "@shared/api";

type FeedData = InfiniteData<PostPage> | undefined;
const flip = (data: FeedData, id: string, liked: boolean): FeedData => {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((post) =>
        post.id === id
          ? {
              ...post,
              likedByMe: !liked,
              likeCount: post.likeCount + (liked ? -1 : 1),
            }
          : post,
      ),
    })),
  };
};
export const useToggleLike = (post: Post) => {
  const queryClient = useQueryClient();

  const feeds = () =>
    queryClient.getQueriesData<InfiniteData<PostPage>>({
      queryKey: postKeys.all(),
    });
  const patch = (liked: boolean) =>
    queryClient.setQueriesData<InfiniteData<PostPage>>(
      { queryKey: postKeys.all() },
      (data) => flip(data, post.id, liked),
    );

  const mutation = useMutation({
    scope: { id: `post-like-${post.id}` },

    mutationFn: ({ liked }: { liked: boolean }) =>
      liked
        ? postsControllerUnlike({ path: { id: post.id }, throwOnError: true })
        : postsControllerLike({ path: { id: post.id }, throwOnError: true }),

    onError: (_error, { liked }) => patch(!liked),

    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: postKeys.all(),
        refetchType: "none",
      }),
  });

  return () => {
    const cached = feeds()
      .flatMap(([, data]) => data?.pages ?? [])
      .flatMap((page) => page.items)
      .find((item) => item.id === post.id);
    const liked = cached?.likedByMe ?? post.likedByMe;

    void queryClient.cancelQueries({ queryKey: postKeys.all() });
    patch(liked);
    mutation.mutate({ liked });
  };
};
