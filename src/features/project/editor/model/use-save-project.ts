import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { chatKeys } from "@entities/chat";
import { projectKeys } from "@entities/project";

import {
  projectsControllerCreate,
  projectsControllerUpdate,
} from "@shared/api";

export interface ProjectValues {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  membersCanEditTasks: boolean;
  attachments: { url: string }[];
}

const toBody = (values: ProjectValues) => ({
  name: values.name,
  description: values.description === "" ? null : values.description,
  startDate: values.startDate === "" ? null : values.startDate,
  endDate: values.endDate === "" ? null : values.endDate,
  attachments: values.attachments.map((link) => link.url).filter(Boolean),
});

const useRefresh = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
  };
};

export const useCreateProject = (teamId: string) => {
  const refresh = useRefresh();

  return useMutation({
    mutationFn: async (values: ProjectValues) => {
      const { data } = await projectsControllerCreate({
        body: { ...toBody(values), teamId },
        throwOnError: true,
      });
      return data;
    },
    onSuccess: refresh,
  });
};

export const useUpdateProject = (projectId: string) => {
  const queryClient = useQueryClient();
  const refresh = useRefresh();

  return useMutation({
    mutationFn: async (values: ProjectValues) => {
      const { data } = await projectsControllerUpdate({
        path: { projectId },
        body: {
          ...toBody(values),
          membersCanEditTasks: values.membersCanEditTasks,
        },
        throwOnError: true,
      });
      return data;
    },
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.byId(projectId), project);
      refresh();
      toast.success("Project updated");
    },
  });
};
