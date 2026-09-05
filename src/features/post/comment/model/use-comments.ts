import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  addMessage,
  chatKeys,
  type Message,
  pendingId,
  replaceMessage,
} from "@entities/chat";
import { patchPost } from "@entities/post";
import { sessionQueries } from "@entities/session";

import {
  ApiError,
  postsControllerChat,
  postsControllerComment,
} from "@shared/api";

export const commentKeys = {
  chat: (postId: string) => ["post", postId, "comment-chat"] as const,
};

export const useCommentChat = (postId: string) =>
  useQuery({
    queryKey: commentKeys.chat(postId),
    queryFn: async () => {
      try {
        const { data } = await postsControllerChat({
          path: { id: postId },
          throwOnError: true,
        });

        return data;
      } catch (error) {
        if (error instanceof ApiError && error.code === "NOT_FOUND") {
          return null;
        }
        throw error;
      }
    },
  });

export const countComment = (
  queryClient: QueryClient,
  postId: string,
  by: number,
) =>
  patchPost(queryClient, postId, (post) => ({
    ...post,
    commentCount: Math.max(0, post.commentCount + by),
  }));

export const useComment = (postId: string, chatId: string | null) => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery(sessionQueries.current());

  return useMutation({
    mutationFn: async (body: string) => {
      const { data } = await postsControllerComment({
        path: { id: postId },
        body: { body },
        throwOnError: true,
      });

      return data;
    },

    onMutate: (body) => {
      if (!chatId || !user) return;

      const optimistic: Message = {
        id: pendingId(),
        chatId,
        author: user,
        body,
        postId: null,
        createdAt: new Date().toISOString(),
        editedAt: null,
      };

      addMessage(queryClient, chatId, optimistic);
      return { messageId: optimistic.id };
    },

    onSuccess: (message, _body, context) => {
      countComment(queryClient, postId, 1);

      if (context && chatId) {
        replaceMessage(queryClient, chatId, context.messageId, message);
      } else {
        void queryClient.invalidateQueries({
          queryKey: commentKeys.chat(postId),
        });
      }

      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
    },

    onError: (error, _body, context) => {
      if (context && chatId) {
        replaceMessage(queryClient, chatId, context.messageId, null);
      }

      toast.error(
        error instanceof ApiError
          ? error.message
          : "The comment did not go out",
      );
    },
  });
};
