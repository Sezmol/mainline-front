import { createFileRoute } from "@tanstack/react-router";

import { CompaniesPage, companiesSearchSchema } from "@pages/companies";

import { companyQueries } from "@entities/company";

export const Route = createFileRoute("/_app/companies")({
  validateSearch: companiesSearchSchema,
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ context, deps }) =>
    context.queryClient.infiniteQuery({
      ...companyQueries.directory(deps.q),
      staleTime: "static",
    }),
  component: CompaniesPage,
});
