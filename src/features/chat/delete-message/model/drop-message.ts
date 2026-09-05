import type { QueryClient } from "@tanstack/react-query";

import {
  chatKeys,
  findChat,
  findMessage,
  replaceMessage,
} from "@entities/chat";
import { patchPost, postKeys } from "@entities/post";

export const dropMessage = (
  queryClient: QueryClient,
  chatId: string,
  messageId: string,
) => {
  const message = findMessage(queryClient, chatId, messageId);
  if (!message) return;

  replaceMessage(queryClient, chatId, messageId, null);

  if (message.postId) {
    patchPost(queryClient, message.postId, (post) => ({
      ...post,
      savedByMe: false,
    }));

    void queryClient.invalidateQueries({
      queryKey: postKeys.all(),
      refetchType: "none",
    });
  }

  const chat = findChat(queryClient, chatId)?.chat;

  if (chat?.type === "content" && chat.post) {
    patchPost(queryClient, chat.post.id, (post) => ({
      ...post,
      commentCount: Math.max(0, post.commentCount - 1),
    }));
  }

  void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
};
