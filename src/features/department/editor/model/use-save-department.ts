import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { chatKeys } from "@entities/chat";
import { companyKeys } from "@entities/company";
import { departmentKeys } from "@entities/department";

import {
  departmentsControllerCreate,
  departmentsControllerRemove,
  departmentsControllerUpdate,
} from "@shared/api";

export interface DepartmentValues {
  name: string;
  managerId: string;
}

const toBody = ({ name, managerId }: DepartmentValues) => ({
  name,
  ...(managerId ? { managerId } : {}),
});

const useRefresh = (companyId: string) => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: departmentKeys.list(companyId),
    });
    void queryClient.invalidateQueries({ queryKey: companyKeys.pages() });
    void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
  };
};

export const useCreateDepartment = (companyId: string) => {
  const refresh = useRefresh(companyId);

  return useMutation({
    mutationFn: async (values: DepartmentValues) => {
      const { data } = await departmentsControllerCreate({
        path: { companyId },
        body: toBody(values),
        throwOnError: true,
      });
      return data;
    },
    onSuccess: refresh,
  });
};

export const useUpdateDepartment = (
  companyId: string,
  departmentId: string,
) => {
  const refresh = useRefresh(companyId);

  return useMutation({
    mutationFn: async (values: DepartmentValues) => {
      const { data } = await departmentsControllerUpdate({
        path: { companyId, departmentId },
        body: toBody(values),
        throwOnError: true,
      });
      return data;
    },
    onSuccess: refresh,
  });
};

export const useDeleteDepartment = (companyId: string) => {
  const refresh = useRefresh(companyId);

  return useMutation({
    mutationFn: async (departmentId: string) => {
      await departmentsControllerRemove({
        path: { companyId, departmentId },
        throwOnError: true,
      });
    },
    onSuccess: () => {
      refresh();
      toast.success("Department deleted");
    },
    onError: () => {
      toast.error("The department could not be deleted");
    },
  });
};
