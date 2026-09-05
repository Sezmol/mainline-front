import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { patchPost, type Post, postKeys } from "@entities/post";
import { sessionQueries } from "@entities/session";

import {
  type InteractDto,
  interactionsControllerInteract,
  toApiError,
} from "@shared/api";

export const useInteract = (post: Post) => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery(sessionQueries.current());

  return useMutation({
    scope: { id: `post-interact-${post.id}` },

    mutationFn: async (body: InteractDto) => {
      const { data } = await interactionsControllerInteract({
        path: { id: post.id },
        body,
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (interaction) => {
      const mine = interaction.user.id === user?.id;

      patchPost(queryClient, post.id, (item) => ({
        ...item,
        acceptedCount:
          interaction.status === "accepted"
            ? item.acceptedCount + 1
            : item.acceptedCount,
        myInteraction: mine
          ? { kind: interaction.kind, status: interaction.status }
          : item.myInteraction,
      }));

      void queryClient.invalidateQueries({
        queryKey: postKeys.interactions(post.id),
      });
    },

    onError: (error) => toast.error(toApiError(error).message),
  });
};
