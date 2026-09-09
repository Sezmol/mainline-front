import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { inviteKeys } from "@entities/invite";

import { invitesControllerWithdraw } from "@shared/api";

export const useWithdrawInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      await invitesControllerWithdraw({
        path: { inviteId },
        throwOnError: true,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.sentAll() });
    },
    onError: () => {
      toast.error("The invitation could not be withdrawn");
    },
  });
};
