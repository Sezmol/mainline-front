import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { chatKeys } from "@entities/chat";
import { companyKeys } from "@entities/company";
import { departmentKeys } from "@entities/department";
import { inviteKeys } from "@entities/invite";
import { notificationKeys } from "@entities/notification";
import { teamKeys } from "@entities/team";

import { invitesControllerDecide, toApiError } from "@shared/api";

type Decision = "accepted" | "declined";

export const useDecideInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inviteId,
      decision,
    }: {
      inviteId: string;
      decision: Decision;
    }) => {
      const { data } = await invitesControllerDecide({
        path: { inviteId },
        body: { decision },
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (_invite, { decision }) => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.mineAll() });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all() });

      if (decision !== "accepted") return;

      void queryClient.invalidateQueries({ queryKey: companyKeys.pages() });
      void queryClient.invalidateQueries({ queryKey: companyKeys.mine() });
      void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
    },

    onError: (error) => {
      if (toApiError(error).code === "CONFLICT") {
        void queryClient.invalidateQueries({ queryKey: inviteKeys.mineAll() });
        return;
      }

      toast.error("Could not answer the invitation");
    },
  });
};
