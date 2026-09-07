import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { companyKeys } from "@entities/company";

import {
  type MemberListDtoOutput,
  membersControllerSetRole,
} from "@shared/api";
import type { AssignableRole } from "@shared/config";

type MemberPages = InfiniteData<MemberListDtoOutput>;

export const useSetRole = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: AssignableRole;
    }) => {
      const { data } = await membersControllerSetRole({
        path: { companyId, userId },
        body: { role },
        throwOnError: true,
      });
      return data;
    },

    onMutate: async ({ userId, role }) => {
      const key = companyKeys.members(companyId);
      await queryClient.cancelQueries({ queryKey: key });

      const snapshot = queryClient.getQueryData<MemberPages>(key);

      queryClient.setQueryData<MemberPages>(key, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((member) =>
                  member.user.id === userId ? { ...member, role } : member,
                ),
              })),
            }
          : data,
      );

      return { key, snapshot };
    },

    onError: (_error, _values, context) => {
      if (context) queryClient.setQueryData(context.key, context.snapshot);
      toast.error("The role could not be changed");
    },
  });
};
