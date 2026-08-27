import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Project, projectKeys } from "@entities/project";

import {
  portfolioControllerCreate,
  portfolioControllerUpdate,
} from "@shared/api";

import { type ProjectFormValues, toProjectBody } from "./project-form.schema";

export const useCreateProject = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const { data } = await portfolioControllerCreate({
        path: { userId },
        body: toProjectBody(values),
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (created) => {
      queryClient.setQueryData<Project[]>(
        projectKeys.list(userId),
        (projects) => [created, ...(projects ?? [])],
      );
    },
  });
};

export const useUpdateProject = (userId: string, projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const { data } = await portfolioControllerUpdate({
        path: { userId, projectId },
        body: toProjectBody(values),
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (updated) => {
      queryClient.setQueryData<Project[]>(
        projectKeys.list(userId),
        (projects) =>
          projects?.map((project) =>
            project.id === projectId ? updated : project,
          ),
      );
      queryClient.setQueryData(projectKeys.byId(userId, projectId), updated);
    },
  });
};
