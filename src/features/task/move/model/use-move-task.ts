import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { patchPost } from "@entities/post";
import { projectKeys } from "@entities/project";

import { postsControllerSetStatus } from "@shared/api";

interface MoveInput {
  taskId: string;
  status: string;
  projectId: string | null;
}

export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    scope: { id: "task-move" },

    mutationFn: async ({ taskId, status }: MoveInput) => {
      const { data } = await postsControllerSetStatus({
        path: { id: taskId },
        body: { status },
        throwOnError: true,
      });
      return data;
    },

    onMutate: ({ taskId, status }) => {
      let previous: string | null = null;

      patchPost(queryClient, taskId, (post) => {
        if (post.type !== "task") return post;
        previous = post.status;
        return { ...post, status };
      });

      return { previous };
    },

    onError: (_error, { taskId }, context) => {
      const previous = context?.previous;

      if (previous) {
        patchPost(queryClient, taskId, (post) =>
          post.type === "task" ? { ...post, status: previous } : post,
        );
      }

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
  });
};
