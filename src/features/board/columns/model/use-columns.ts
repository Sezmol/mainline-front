import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { postKeys } from "@entities/post";
import { type BoardColumn, projectKeys } from "@entities/project";

import {
  projectsControllerAddColumn,
  projectsControllerRemoveColumn,
  projectsControllerReorderColumns,
  projectsControllerUpdateColumn,
} from "@shared/api";
import type { ColumnKind } from "@shared/config";

export interface ColumnValues {
  name: string;
  kind: ColumnKind;
}

const useRefresh = (projectId: string) => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: projectKeys.columns(projectId),
    });
    void queryClient.invalidateQueries({ queryKey: projectKeys.details() });
    void queryClient.invalidateQueries({ queryKey: postKeys.all() });
  };
};

export const useAddColumn = (projectId: string) => {
  const refresh = useRefresh(projectId);

  return useMutation({
    mutationFn: async (values: ColumnValues) => {
      const { data } = await projectsControllerAddColumn({
        path: { projectId },
        body: values,
        throwOnError: true,
      });
      return data;
    },
    onSuccess: refresh,
  });
};

export const useUpdateColumn = (projectId: string, columnId: string) => {
  const refresh = useRefresh(projectId);

  return useMutation({
    mutationFn: async (values: ColumnValues) => {
      const { data } = await projectsControllerUpdateColumn({
        path: { projectId, columnId },
        body: values,
        throwOnError: true,
      });
      return data;
    },
    onSuccess: refresh,
  });
};

export const useRemoveColumn = (projectId: string) => {
  const refresh = useRefresh(projectId);

  return useMutation({
    mutationFn: async (columnId: string) => {
      await projectsControllerRemoveColumn({
        path: { projectId, columnId },
        throwOnError: true,
      });
    },
    onSuccess: () => {
      refresh();
      toast.success("Column deleted, its tasks moved to the first one");
    },
    onError: () => {
      toast.error("The column could not be deleted");
    },
  });
};

export const useReorderColumns = (projectId: string) => {
  const queryClient = useQueryClient();
  const key = projectKeys.columns(projectId);

  return useMutation({
    mutationFn: async (columnIds: string[]) => {
      const { data } = await projectsControllerReorderColumns({
        path: { projectId },
        body: { columnIds },
        throwOnError: true,
      });
      return data;
    },

    onMutate: async (columnIds) => {
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<BoardColumn[]>(key);

      queryClient.setQueryData<BoardColumn[]>(key, (columns) =>
        columns
          ? columnIds
              .map((id) => columns.find((column) => column.id === id))
              .filter((column) => column !== undefined)
          : columns,
      );

      return { snapshot };
    },

    onError: (_error, _ids, context) => {
      if (context?.snapshot) queryClient.setQueryData(key, context.snapshot);
      toast.error("The board could not be reordered");
    },

    onSuccess: (columns) => {
      queryClient.setQueryData(key, columns);
    },
  });
};
