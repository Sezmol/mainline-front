import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { chatKeys } from "@entities/chat";
import { companyKeys, patchCompanyPage } from "@entities/company";
import { departmentKeys } from "@entities/department";
import { teamKeys } from "@entities/team";

import { type MemberListDtoOutput, membersControllerRemove } from "@shared/api";

type MemberPages = InfiniteData<MemberListDtoOutput>;

export const useRemoveMember = (companyId: string, slug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await membersControllerRemove({
        path: { companyId, userId },
        throwOnError: true,
      });
      return userId;
    },

    onSuccess: (userId) => {
      queryClient.setQueryData<MemberPages>(
        companyKeys.members(companyId),
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  items: page.items.filter(
                    (member) => member.user.id !== userId,
                  ),
                })),
              }
            : data,
      );

      patchCompanyPage(queryClient, slug, (page) => ({
        ...page,
        employeeCount: Math.max(0, page.employeeCount - 1),
      }));

      void queryClient.invalidateQueries({
        queryKey: departmentKeys.lists(),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
      void queryClient.invalidateQueries({ queryKey: companyKeys.pages() });
      void queryClient.invalidateQueries({ queryKey: companyKeys.mine() });
    },

    onError: () => {
      toast.error("That person could not be removed");
    },
  });
};
