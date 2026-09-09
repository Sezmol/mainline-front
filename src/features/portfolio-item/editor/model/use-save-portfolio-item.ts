import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type PortfolioItem,
  portfolioItemKeys,
} from "@entities/portfolio-item";

import {
  portfolioControllerCreate,
  portfolioControllerUpdate,
} from "@shared/api";

import {
  type PortfolioItemFormValues,
  toPortfolioItemBody,
} from "./portfolio-item-form.schema";

export const useCreateProject = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PortfolioItemFormValues) => {
      const { data } = await portfolioControllerCreate({
        path: { userId },
        body: toPortfolioItemBody(values),
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (created) => {
      queryClient.setQueryData<PortfolioItem[]>(
        portfolioItemKeys.list(userId),
        (items) => [created, ...(items ?? [])],
      );
    },
  });
};

export const useUpdateProject = (userId: string, itemId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PortfolioItemFormValues) => {
      const { data } = await portfolioControllerUpdate({
        path: { userId, itemId },
        body: toPortfolioItemBody(values),
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (updated) => {
      queryClient.setQueryData<PortfolioItem[]>(
        portfolioItemKeys.list(userId),
        (items) => items?.map((item) => (item.id === itemId ? updated : item)),
      );
      queryClient.setQueryData(portfolioItemKeys.byId(userId, itemId), updated);
    },
  });
};
