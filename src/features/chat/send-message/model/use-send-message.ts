import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  addMessage,
  chatKeys,
  type Message,
  patchChat,
  pendingId,
  replaceMessage,
} from "@entities/chat";
import { sessionQueries } from "@entities/session";

import { chatsControllerSend, NetworkError } from "@shared/api";

import { useOutboxStore } from "./outbox.store";

interface SendInput {
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

      const optimistic: Message = {
        id: pendingId(),
        chatId,
        author: user,
        body: input.body,
        postId: input.postId ?? null,
        createdAt: new Date().toISOString(),
        editedAt: null,
      };

      addMessage(queryClient, chatId, optimistic);
      return { messageId: optimistic.id, input };
    },

    onSuccess: (message, _input, context) => {
      if (context)
        replaceMessage(queryClient, chatId, context.messageId, message);

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

    onError: (error, _input, context) => {
      if (!context) return;

      if (error instanceof NetworkError) {
        enqueue({
          chatId,
          messageId: context.messageId,
          body: context.input.body,
          postId: context.input.postId,
        });
        toast.warning(
          "No connection. The message will go out when it is back.",
        );
        return;
      }

      replaceMessage(queryClient, chatId, context.messageId, null);
      toast.error(error.message);
    },

    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: chatKeys.all(),
        refetchType: "none",
      }),
  });
};
