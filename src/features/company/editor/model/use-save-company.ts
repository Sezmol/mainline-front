import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { chatKeys } from "@entities/chat";
import { type Company, companyKeys } from "@entities/company";

import {
  companiesControllerCreate,
  companiesControllerUpdate,
} from "@shared/api";

import { type CompanyFormValues, toCompanyBody } from "./company-form.schema";

export const useSaveCompany = (company?: Pick<Company, "id" | "slug">) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: CompanyFormValues) => {
      const body = toCompanyBody(values);

      const { data } = company
        ? await companiesControllerUpdate({
            path: { companyId: company.id },
            body,
            throwOnError: true,
          })
        : await companiesControllerCreate({ body, throwOnError: true });

      return data;
    },

    onSuccess: (saved) => {
      void queryClient.invalidateQueries({
        queryKey: companyKeys.directories(),
      });

      if (!company) {
        void queryClient.invalidateQueries({ queryKey: companyKeys.mine() });
        void queryClient.invalidateQueries({ queryKey: chatKeys.all() });

        void navigate({
          to: "/c/$slug",
          params: { slug: saved.slug },
          search: { tab: "overview" as const },
        });
        return;
      }

      queryClient.setQueryData(companyKeys.page(saved.slug), (page) =>
        page ? { ...page, ...saved } : page,
      );

      if (saved.slug === company.slug) return;

      queryClient.removeQueries({ queryKey: companyKeys.page(company.slug) });
      void navigate({
        to: "/c/$slug/settings",
        params: { slug: saved.slug },
        search: { tab: "profile" as const },
        replace: true,
      });
    },
  });
};
