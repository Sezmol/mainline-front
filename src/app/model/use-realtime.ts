import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { dropMessage } from "@features/chat/delete-message";
import { flushOutbox } from "@features/chat/send-message";

import {
  addMessage,
  chatKeys,
  dropChat,
  patchChat,
  useDockStore,
} from "@entities/chat";
import { inviteKeys } from "@entities/invite";
import { notificationKeys } from "@entities/notification";
import { postKeys } from "@entities/post";
import { projectKeys } from "@entities/project";

import { closeSocket, getSocket } from "@shared/api";

export const useRealtime = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    socket.on("new_message", ({ chatId, message }) => {
      addMessage(queryClient, chatId, message);

      patchChat(
        queryClient,
        chatId,
        (view) => ({
          ...view,
          lastMessage: message,
          chat: { ...view.chat, lastMessageAt: message.createdAt },
          unreadCount:
            message.author.id === userId
              ? view.unreadCount
              : view.unreadCount + 1,
        }),
        { toTop: true },
      );
    });

    socket.on("message_deleted", ({ chatId, messageId }) => {
      dropMessage(queryClient, chatId, messageId);
    });

    socket.on("chat_created", () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
    });

    socket.on("chat_updated", ({ chat }) => {
      patchChat(queryClient, chat.id, (view) => ({ ...view, chat }));

      void queryClient.invalidateQueries({ queryKey: chatKeys.byId(chat.id) });
    });

    socket.on("chat_removed", ({ chatId }) => {
      dropChat(queryClient, chatId);
      useDockStore.getState().forget(chatId);
    });

    socket.on("write_access_changed", ({ chatId, canWrite }) => {
      patchChat(queryClient, chatId, (view) => ({ ...view, canWrite }));
    });

    socket.on("unread_changed", ({ chatId, unreadCount }) => {
      patchChat(queryClient, chatId, (view) => ({ ...view, unreadCount }));
    });

    socket.on("notification_created", () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
      void queryClient.invalidateQueries({ queryKey: inviteKeys.mineAll() });
    });

    socket.on("board_changed", ({ projectId }) => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all() });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.byId(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.columns(projectId),
      });
    });

    socket.on("connect", () => void flushOutbox(queryClient));

    socket.connect();

    return () => {
      socket.removeAllListeners();
      closeSocket();
    };
  }, [queryClient, userId]);
};
