import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchChat } from "@entities/chat";

import { chatsControllerRead } from "@shared/api";

export const useMarkRead = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    scope: { id: `chat-read-${chatId}` },

    mutationFn: async (messageId: string) => {
      const { data } = await chatsControllerRead({
        path: { id: chatId },
        body: { messageId },
        throwOnError: true,
      });

      return data;
    },

    onSuccess: ({ unreadCount }) =>
      patchChat(queryClient, chatId, (view) => ({ ...view, unreadCount })),
  });
};
