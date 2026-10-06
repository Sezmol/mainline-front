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

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PostPayload) => {
      const { data } = await postsControllerCreate({
        body: payload,
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (created) => {
      queryClient.setQueryData(postKeys.byId(created.id), created);
      void queryClient.invalidateQueries({ queryKey: postKeys.all() });
      invalidateProjects(queryClient, [projectId(created)]);
    },
  });
};

export const useUpdatePost = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PostPayload) => {
      const { data } = await postsControllerUpdate({
        path: { id },
        body: payload,
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (updated) => {
      const before = findPost(queryClient, id);
      queryClient.setQueryData(postKeys.byId(id), updated);
      patchPost(queryClient, id, () => updated);
      void queryClient.invalidateQueries({ queryKey: postKeys.all() });
      invalidateProjects(queryClient, [projectId(before), projectId(updated)]);
    },
  });
};
