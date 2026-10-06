import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addMessage, chatKeys, patchChat, removeMessage } from "@entities/chat";
import { sessionQueries } from "@entities/session";

import { chatsControllerSend, NetworkError } from "@shared/api";

import { useOutboxStore } from "./outbox.store";

interface SendInput {
  id: string;
  body: string;
  postId?: string;
}

export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery(sessionQueries.current());
  const enqueue = useOutboxStore((state) => state.enqueue);

  return useMutation({
    mutationFn: async (input: SendInput) => {
      const { data } = await chatsControllerSend({
        path: { id: chatId },
        body: input,
        throwOnError: true,
      });

      return data;
    },

    onMutate: (input) => {
      if (!user) return;

      addMessage(queryClient, chatId, {
        id: input.id,
        chatId,
        author: user,
        body: input.body,
        postId: input.postId ?? null,
        createdAt: new Date().toISOString(),
        editedAt: null,
        pending: true,
      });
    },

    onSuccess: (message) => {
      addMessage(queryClient, chatId, message);

      patchChat(
        queryClient,
        chatId,
        (view) => ({
          ...view,
          lastMessage: message,
          chat: { ...view.chat, lastMessageAt: message.createdAt },
        }),
        { toTop: true },
      );
    },

    onError: (error, input) => {
      if (error instanceof NetworkError) {
        enqueue({
          chatId,
          messageId: input.id,
          body: input.body,
          postId: input.postId,
        });
        toast.warning(
          "No connection. The message will go out when it is back.",
        );
        return;
      }

      removeMessage(queryClient, chatId, input.id);
      toast.error(error.message);
    },

    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: chatKeys.all(),
        refetchType: "none",
      }),
  });
};
