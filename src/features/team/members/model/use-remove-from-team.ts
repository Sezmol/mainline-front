import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { chatKeys } from "@entities/chat";
import { teamKeys } from "@entities/team";

import { teamsControllerRemoveMember } from "@shared/api";

export const useRemoveFromTeam = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await teamsControllerRemoveMember({
        path: { teamId, userId },
        throwOnError: true,
      });
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.members(teamId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.byId(teamId) });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
    },

    onError: () => {
      toast.error("That person could not be removed from the team");
    },
  });
};
