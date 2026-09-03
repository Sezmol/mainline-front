import { useMutation, useQueryClient } from "@tanstack/react-query";

import { findPost, patchPost, type Post, postKeys } from "@entities/post";

import { postsControllerLike, postsControllerUnlike } from "@shared/api";

export const useToggleLike = (post: Post) => {
  const queryClient = useQueryClient();

  const patch = (liked: boolean) =>
    patchPost(queryClient, post.id, (item) => ({
      ...item,
      likedByMe: !liked,
      likeCount: item.likeCount + (liked ? -1 : 1),
    }));

  const mutation = useMutation({
    scope: { id: `post-like-${post.id}` },

    mutationFn: ({ liked }: { liked: boolean }) =>
      liked
        ? postsControllerUnlike({ path: { id: post.id }, throwOnError: true })
        : postsControllerLike({ path: { id: post.id }, throwOnError: true }),

    onError: (_error, { liked }) => patch(!liked),

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.likes(post.id) });
      return queryClient.invalidateQueries({
        queryKey: postKeys.all(),
        refetchType: "none",
      });
    },
  });

  return () => {
    const liked = findPost(queryClient, post.id)?.likedByMe ?? post.likedByMe;

    void queryClient.cancelQueries({ queryKey: postKeys.all() });
    patch(liked);
    mutation.mutate({ liked });
  };
};
