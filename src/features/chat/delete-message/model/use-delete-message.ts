import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Message } from "@entities/chat";

import { ApiError, chatsControllerRemoveMessage } from "@shared/api";

import { dropMessage } from "./drop-message";

export const useDeleteMessage = (message: Message) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      chatsControllerRemoveMessage({
        path: { id: message.chatId, messageId: message.id },
        throwOnError: true,
      }),

    onSuccess: () => dropMessage(queryClient, message.chatId, message.id),

    onError: (error) =>
      toast.error(
        error instanceof ApiError ? error.message : "The message stayed",
      ),
  });
};
