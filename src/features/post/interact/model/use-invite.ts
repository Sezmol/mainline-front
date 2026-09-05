import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { type Post, postKeys } from "@entities/post";

import {
  interactionsControllerInteract,
  toApiError,
  usersControllerByNickname,
} from "@shared/api";

export const useInvite = (post: Post) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nickname: string) => {
      const { data: profile } = await usersControllerByNickname({
        path: { nickname: nickname.trim().toLowerCase() },
        throwOnError: true,
      });

      const { data } = await interactionsControllerInteract({
        path: { id: post.id },
        body: { action: "invite", userId: profile.id },
        throwOnError: true,
      });

      return data;
    },

    onSuccess: (interaction) => {
      toast.success(`Invitation sent to @${interaction.user.nickname}`);
      return queryClient.invalidateQueries({
        queryKey: postKeys.interactions(post.id),
      });
    },

    onError: (error) => toast.error(toApiError(error).message),
  });
};
