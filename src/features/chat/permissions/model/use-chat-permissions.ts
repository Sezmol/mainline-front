import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { chatKeys, patchChat } from "@entities/chat";

import {
  chatsControllerRemove,
  chatsControllerSetParticipantWrite,
  chatsControllerSettings,
} from "@shared/api";

export const useRestrictWriting = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (writeRestricted: boolean) => {
      const { data } = await chatsControllerSettings({
        path: { id: chatId },
        body: { writeRestricted },
        throwOnError: true,
      });

      return data;
    },

    onSuccess: (chat) =>
      patchChat(queryClient, chatId, (view) => ({ ...view, chat })),

    onError: () => toast.error("The setting could not be saved"),
  });
};

export const useSetParticipantWrite = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, canWrite }: { userId: string; canWrite: boolean }) =>
      chatsControllerSetParticipantWrite({
        path: { id: chatId, userId },
        body: { canWrite },
        throwOnError: true,
      }),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: chatKeys.participants(chatId),
      }),

    onError: () => toast.error("The change could not be saved"),
  });
};

export const useRemoveParticipant = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      chatsControllerRemove({
        path: { id: chatId, userId },
        throwOnError: true,
      }),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: chatKeys.participants(chatId),
      });
      toast.success("Removed from the chat");
    },

    onError: () => toast.error("The participant could not be removed"),
  });
};
