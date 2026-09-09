import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { chatKeys } from "@entities/chat";
import { type Company, companyKeys } from "@entities/company";

import {
  companiesControllerCreate,
  companiesControllerUpdate,
} from "@shared/api";

import { type CompanyFormValues, toCompanyBody } from "./company-form.schema";

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: CompanyFormValues) => {
      const { data } = await companiesControllerCreate({
        body: toCompanyBody(values),
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (company) => {
      void queryClient.invalidateQueries({
        queryKey: companyKeys.directories(),
      });
      void queryClient.invalidateQueries({ queryKey: companyKeys.mine() });
      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });

      void navigate({
        to: "/c/$slug",
        params: { slug: company.slug },
        search: { tab: "overview" as const },
      });
    },
  });
};

export const useUpdateCompany = (company: Company) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: CompanyFormValues) => {
      const { data } = await companiesControllerUpdate({
        path: { companyId: company.id },
        body: toCompanyBody(values),
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (updated) => {
      queryClient.setQueryData(companyKeys.page(updated.slug), (page) =>
        page ? { ...page, ...updated } : page,
      );
      void queryClient.invalidateQueries({
        queryKey: companyKeys.directories(),
      });

      if (updated.slug === company.slug) return;

      queryClient.removeQueries({ queryKey: companyKeys.page(company.slug) });
      void navigate({
        to: "/c/$slug/settings",
        params: { slug: updated.slug },
        search: { tab: "profile" as const },
        replace: true,
      });
    },
  });
};
