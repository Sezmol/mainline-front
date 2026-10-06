import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { findPost, patchPost, postKeys } from "@entities/post";
import { projectKeys } from "@entities/project";

import { postsControllerSetStatus } from "@shared/api";

interface MoveInput {
  taskId: string;
  status: string;
  projectId: string | null;
}

const mutationKey = ["task-move"];

export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey,
    scope: { id: "task-move" },

    mutationFn: async ({ taskId, status }: MoveInput) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all() });
      await queryClient.cancelQueries({ queryKey: postKeys.byId(taskId) });

      const previous = findPost(queryClient, taskId);
      patchPost(queryClient, taskId, (post) =>
        post.type === "task" ? { ...post, status } : post,
      );

      try {
        const { data } = await postsControllerSetStatus({
          path: { id: taskId },
          body: { status },
          throwOnError: true,
        });
        return data;
      } catch (error) {
        if (previous?.type === "task") {
          patchPost(queryClient, taskId, (post) =>
            post.type === "task" ? { ...post, status: previous.status } : post,
          );
        }
        throw error;
      }
    },

    onError: () => {
      toast.error("The task could not be moved");
    },

    onSuccess: (task, { projectId }) => {
      patchPost(queryClient, task.id, () => task);

      if (projectId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.byId(projectId),
        });
      }
    },

    onSettled: (_data, _error, { taskId }) => {
      if (queryClient.isMutating({ mutationKey }) !== 1) return;
      void queryClient.invalidateQueries({ queryKey: postKeys.byId(taskId) });
      return queryClient.invalidateQueries({ queryKey: postKeys.all() });
    },
  });
};
