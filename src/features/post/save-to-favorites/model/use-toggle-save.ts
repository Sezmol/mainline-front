import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { chatKeys, useDockStore } from "@entities/chat";
import { findPost, patchPost, type Post, postKeys } from "@entities/post";

import {
  ApiError,
  postsControllerSave,
  postsControllerUnsave,
} from "@shared/api";

export const useToggleSave = (post: Post) => {
  const queryClient = useQueryClient();
  const openChat = useDockStore((state) => state.openChat);

  const patch = (saved: boolean) =>
    patchPost(queryClient, post.id, (item) => ({ ...item, savedByMe: !saved }));

  const mutation = useMutation({
    scope: { id: `post-save-${post.id}` },

    mutationFn: async ({ saved }: { saved: boolean }) => {
      if (saved) {
        await postsControllerUnsave({
          path: { id: post.id },
          throwOnError: true,
        });

        return null;
      }

      const { data } = await postsControllerSave({
        path: { id: post.id },
        throwOnError: true,
      });

      return data;
    },

    onSuccess: (message) => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });

      if (!message) {
        toast.success("Removed from Favourites");
        return;
      }

      toast.success("Saved to Favourites", {
        action: { label: "Open", onClick: () => openChat(message.chatId) },
      });
    },

    onError: (error, { saved }) => {
      patch(!saved);
      toast.error(
        error instanceof ApiError ? error.message : "The post was not saved",
      );
    },

    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: postKeys.all(),
        refetchType: "none",
      }),
  });

  return {
    isPending: mutation.isPending,

    toggle: () => {
      const saved = findPost(queryClient, post.id)?.savedByMe ?? post.savedByMe;

      void queryClient.cancelQueries({ queryKey: postKeys.all() });
      patch(saved);
      mutation.mutate({ saved });
    },
  };
};
