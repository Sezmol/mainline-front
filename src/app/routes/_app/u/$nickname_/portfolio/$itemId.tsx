import { createFileRoute, notFound } from "@tanstack/react-router";

import {
  PortfolioItemNotFound,
  PortfolioItemPage,
} from "@pages/portfolio-item";

import { portfolioItemQueries } from "@entities/portfolio-item";
import { userQueries } from "@entities/user";

import { ApiError } from "@shared/api";

export const Route = createFileRoute("/_app/u/$nickname_/portfolio/$itemId")({
  loader: async ({ context, params }) => {
    try {
      const profile = await context.queryClient.query({
        ...userQueries.profile(params.nickname),
        staleTime: "static",
      });

      await context.queryClient.query({
        ...portfolioItemQueries.byId(profile.id, params.itemId),
        staleTime: "static",
      });

      return { userId: profile.id };
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
  component: PortfolioItemPage,
  notFoundComponent: PortfolioItemNotFound,
});
