import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { dropMessage } from "@features/chat/delete-message";
import { flushOutbox, startOutbox } from "@features/chat/send-message";

import {
  addMessage,
  beginMessageReconciliation,
  chatKeys,
  dropChat,
  finishMessageReconciliation,
  patchChat,
  useDockStore,
} from "@entities/chat";
import { inviteKeys } from "@entities/invite";
import { notificationKeys } from "@entities/notification";
import { postKeys } from "@entities/post";
import { projectKeys } from "@entities/project";
import { sessionKeys } from "@entities/session";

import { closeSocket, getSocket, refreshSession } from "@shared/api";

const RECONCILED_KEYS = [
  chatKeys.all(),
  chatKeys.details(),
  chatKeys.histories(),
  chatKeys.participantsAll(),
  notificationKeys.all(),
  inviteKeys.mineAll(),
  inviteKeys.sentAll(),
  postKeys.all(),
  postKeys.details(),
  projectKeys.details(),
  projectKeys.columnsAll(),
];

export const useRealtime = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    let active = true;
    let connected = false;
    let authRetry = false;
    let reconcilePending = false;
    let reconciling: Promise<void> | null = null;
    const socket = getSocket();
    const stopOutbox = startOutbox(queryClient);

    const reconcile = async () => {
      beginMessageReconciliation();

      await Promise.all(
        RECONCILED_KEYS.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );

      if (active) finishMessageReconciliation(queryClient);
    };

    const reconcileAll = async () => {
      while (active && reconcilePending) {
        reconcilePending = false;
        await reconcile();
      }
    };

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

    socket.on("connect", () => {
      const needsReconcile = connected || authRetry;
      connected = true;
      authRetry = false;

      if (!needsReconcile) {
        void flushOutbox(queryClient);
        return;
      }

      reconcilePending = true;
      if (reconciling) return;

      reconciling = reconcileAll().finally(() => {
        reconciling = null;
        if (active) void flushOutbox(queryClient);
      });
    });

    socket.on("connect_error", (error) => {
      if (authRetry || error.message.toLowerCase() !== "unauthorized") return;

      authRetry = true;
      void refreshSession().then((refreshed) => {
        if (!active) return;

        if (refreshed) {
          socket.connect();
          return;
        }

        void queryClient.invalidateQueries({ queryKey: sessionKeys.current() });
      });
    });

    socket.connect();

    return () => {
      active = false;
      stopOutbox();
      socket.removeAllListeners();
      closeSocket();
    };
  }, [queryClient, userId]);
};
