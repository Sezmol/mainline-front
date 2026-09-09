import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { inviteKeys } from "@entities/invite";

import {
  inviteTargetsControllerToCompany,
  inviteTargetsControllerToDepartment,
  inviteTargetsControllerToTeam,
} from "@shared/api";
import type { AssignableRole } from "@shared/config";

export type InviteTarget =
  | { scope: "company"; companyId: string }
  | { scope: "department"; companyId: string; departmentId: string }
  | { scope: "team"; teamId: string };

interface InviteValues {
  nickname: string;
  role?: AssignableRole;
}

export const useInvite = (target: InviteTarget) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nickname, role }: InviteValues) => {
      const body = { nickname, ...(role ? { role } : {}) };

      switch (target.scope) {
        case "company": {
          const { data } = await inviteTargetsControllerToCompany({
            path: { companyId: target.companyId },
            body,
            throwOnError: true,
          });
          return data;
        }
        case "department": {
          const { data } = await inviteTargetsControllerToDepartment({
            path: {
              companyId: target.companyId,
              departmentId: target.departmentId,
            },
            body,
            throwOnError: true,
          });
          return data;
        }
        case "team": {
          const { data } = await inviteTargetsControllerToTeam({
            path: { teamId: target.teamId },
            body,
            throwOnError: true,
          });
          return data;
        }
      }
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.sentAll() });
      toast.success("Invitation sent");
    },
  });
};
