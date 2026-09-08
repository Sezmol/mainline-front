import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { chatKeys } from "@entities/chat";
import { postKeys } from "@entities/post";
import { projectKeys } from "@entities/project";

import { projectsControllerRemove } from "@shared/api";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (projectId: string) => {
      await projectsControllerRemove({
        path: { projectId },
        throwOnError: true,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: postKeys.all() });
      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
      void navigate({ to: "/projects" });
      toast.success("Project deleted");
    },
    onError: () => {
      toast.error("The project could not be deleted");
    },
  });
};
