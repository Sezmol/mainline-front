import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { patchPost, postKeys } from "@entities/post";
import { projectKeys } from "@entities/project";

import {
  postsControllerAssign,
  postsControllerUnassign,
  toApiError,
} from "@shared/api";

const useAfterChange = (projectId: string | null) => {
  const queryClient = useQueryClient();

  return (task: Awaited<ReturnType<typeof postsControllerAssign>>["data"]) => {
    if (task) patchPost(queryClient, task.id, () => task);

    void queryClient.invalidateQueries({ queryKey: postKeys.all() });

    if (projectId) {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.byId(projectId),
      });
    }
  };
};

export const useAssign = (taskId: string, projectId: string | null) => {
  const after = useAfterChange(projectId);

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await postsControllerAssign({
        path: { id: taskId },
        body: { userId },
        throwOnError: true,
      });
      return data;
    },
    onSuccess: after,
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });
};

export const useUnassign = (taskId: string, projectId: string | null) => {
  const after = useAfterChange(projectId);

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await postsControllerUnassign({
        path: { id: taskId, userId },
        throwOnError: true,
      });
      return data;
    },
    onSuccess: after,
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });
};
