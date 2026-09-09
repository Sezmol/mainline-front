import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { companyKeys } from "@entities/company";

import { membersControllerTransfer } from "@shared/api";

export const useTransferOwnership = (companyId: string, slug: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (userId: string) => {
      await membersControllerTransfer({
        path: { companyId },
        body: { userId },
        throwOnError: true,
      });
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: companyKeys.members(companyId),
      });
      void queryClient.invalidateQueries({ queryKey: companyKeys.pages() });

      void navigate({
        to: "/c/$slug",
        params: { slug },
        search: { tab: "overview" as const },
      });
      toast.success("The company has a new owner");
    },

    onError: () => {
      toast.error("The company could not be handed over");
    },
  });
};
