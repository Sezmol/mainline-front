import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { chatKeys } from "@entities/chat";
import { companyKeys } from "@entities/company";
import { departmentKeys } from "@entities/department";

import { departmentsControllerRemoveMember } from "@shared/api";

export const useRemoveFromDepartment = (
  companyId: string,
  departmentId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await departmentsControllerRemoveMember({
        path: { companyId, departmentId, userId },
        throwOnError: true,
      });
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.members(companyId, departmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: departmentKeys.list(companyId),
      });
      void queryClient.invalidateQueries({ queryKey: companyKeys.pages() });
      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
    },

    onError: () => {
      toast.error("That person could not be removed from the department");
    },
  });
};
