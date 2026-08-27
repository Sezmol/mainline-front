import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { type Project, projectKeys } from "@entities/project";

import { portfolioControllerRemove } from "@shared/api";

export const useDeleteProject = (userId: string, projectId: string) => {
  const queryClient = useQueryClient();
  const listKey = projectKeys.list(userId);

  return useMutation({
    mutationFn: () =>
      portfolioControllerRemove({
        path: { userId, projectId },
        throwOnError: true,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const snapshot = queryClient.getQueryData<Project[]>(listKey);
      queryClient.setQueryData<Project[]>(listKey, (projects) =>
        projects?.filter((project) => project.id !== projectId),
      );
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(listKey, context.snapshot);
      }
      toast.error("The project could not be deleted");
    },

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: projectKeys.byId(userId, projectId),
      });
      toast.success("Project deleted");
    },
  });
};
