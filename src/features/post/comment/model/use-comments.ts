import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { addMessage, chatKeys, removeMessage } from "@entities/chat";
import { patchPost } from "@entities/post";
import { sessionQueries } from "@entities/session";

import {
  ApiError,
  postsControllerChat,
  postsControllerComment,
} from "@shared/api";

interface CommentInput {
  id: string;
  body: string;
}

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
    mutationFn: async (input: CommentInput) => {
      const { data } = await postsControllerComment({
        path: { id: postId },
        body: input,
        throwOnError: true,
      });

      return data;
    },

    onMutate: (input) => {
      if (!chatId || !user) return;

      addMessage(queryClient, chatId, {
        id: input.id,
        chatId,
        author: user,
        body: input.body,
        postId: null,
        createdAt: new Date().toISOString(),
        editedAt: null,
        pending: true,
      });
    },

    onSuccess: (message) => {
      countComment(queryClient, postId, 1);

      if (chatId) {
        addMessage(queryClient, chatId, message);
      } else {
        void queryClient.invalidateQueries({
          queryKey: commentKeys.chat(postId),
        });
      }

      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
    },

    onError: (error, input) => {
      if (chatId) removeMessage(queryClient, chatId, input.id);

      toast.error(
        error instanceof ApiError
          ? error.message
          : "The comment did not go out",
      );
    },
  });
};
