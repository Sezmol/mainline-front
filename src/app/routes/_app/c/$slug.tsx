import { createFileRoute, notFound } from "@tanstack/react-router";

import {
  CompanyNotFound,
  CompanyPage,
  companySearchSchema,
} from "@pages/company";

import { companyQueries } from "@entities/company";

import { ApiError } from "@shared/api";

export const Route = createFileRoute("/_app/c/$slug")({
  validateSearch: companySearchSchema,
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.query({
        ...companyQueries.page(params.slug),
        staleTime: "static",
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
  component: CompanyPage,
  notFoundComponent: CompanyNotFound,
});
