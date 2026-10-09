import { useMutation, useQueryClient } from "@tanstack/react-query";

import { findPost, patchPost, type Post, postKeys } from "@entities/post";
import { projectKeys } from "@entities/project";

import { postsControllerCreate, postsControllerUpdate } from "@shared/api";

import type { toPayload } from "./post-form.schema";

type PostPayload = ReturnType<typeof toPayload>;

const projectId = (post: Post | undefined) =>
  post?.type === "task" ? post.projectId : null;

const invalidateProjects = (
  queryClient: ReturnType<typeof useQueryClient>,
  ids: Array<string | null>,
) => {
  for (const id of new Set(ids)) {
    if (!id) continue;
    void queryClient.invalidateQueries({ queryKey: projectKeys.byId(id) });
    void queryClient.invalidateQueries({ queryKey: projectKeys.columns(id) });
  }
};

export const useSavePost = (postId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PostPayload) => {
      const { data } = postId
        ? await postsControllerUpdate({
            path: { id: postId },
            body: payload,
            throwOnError: true,
          })
        : await postsControllerCreate({ body: payload, throwOnError: true });

      return data;
    },

    onSuccess: (saved) => {
      const before = postId ? findPost(queryClient, postId) : undefined;

      queryClient.setQueryData(postKeys.byId(saved.id), saved);
      if (postId) patchPost(queryClient, postId, () => saved);

      void queryClient.invalidateQueries({ queryKey: postKeys.all() });
      invalidateProjects(queryClient, [projectId(before), projectId(saved)]);
    },
  });
};
