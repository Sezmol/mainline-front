import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import {
  CompanySettingsPage,
  settingsSearchSchema,
} from "@pages/company-settings";

import { companyQueries } from "@entities/company";

import { ApiError } from "@shared/api";

export const Route = createFileRoute("/_app/c/$slug_/settings")({
  validateSearch: settingsSearchSchema,
  beforeLoad: async ({ context, params }) => {
    let company;

    try {
      company = await context.queryClient.query(
        companyQueries.page(params.slug),
      );
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }

    const role = company.viewer?.role;

    if (role !== "owner" && role !== "hr") {
      throw redirect({
        to: "/c/$slug",
        params,
        search: { tab: "overview" as const },
      });
    }
  },
  component: CompanySettingsPage,
});
