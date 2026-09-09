import type { QueryClient } from "@tanstack/react-query";

import { companyKeys } from "../api/company.queries";
import type { CompanyPage } from "../company.types";

export const patchCompanyPage = (
  queryClient: QueryClient,
  slug: string,
  patch: (page: CompanyPage) => CompanyPage,
) => {
  queryClient.setQueryData<CompanyPage>(companyKeys.page(slug), (page) =>
    page ? patch(page) : page,
  );
};
