import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  type PortfolioItem,
  portfolioItemKeys,
} from "@entities/portfolio-item";

import { portfolioControllerRemove } from "@shared/api";

export const useDeletePortfolioItem = (userId: string, itemId: string) => {
  const queryClient = useQueryClient();
  const listKey = portfolioItemKeys.list(userId);

  return useMutation({
    mutationFn: () =>
      portfolioControllerRemove({
        path: { userId, itemId },
        throwOnError: true,
      }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: listKey });

      const snapshot = queryClient.getQueryData<PortfolioItem[]>(listKey);

      queryClient.setQueryData<PortfolioItem[]>(listKey, (items) =>
        items?.filter((item) => item.id !== itemId),
      );

      return { snapshot };
    },

    onError: (_error, _variables, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(listKey, context.snapshot);
      }
      toast.error("The item could not be deleted");
    },

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: portfolioItemKeys.byId(userId, itemId),
      });
      toast.success("Deleted");
    },
  });
};
