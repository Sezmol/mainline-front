import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { postKeys, type PostPage } from "@entities/post";

import { postsControllerRemove } from "@shared/api";

export const useDeletePost = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      postsControllerRemove({ path: { id }, throwOnError: true }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: postKeys.all() });

      const snapshot = queryClient.getQueriesData<InfiniteData<PostPage>>({
        queryKey: postKeys.all(),
      });

      queryClient.setQueriesData<InfiniteData<PostPage>>(
        { queryKey: postKeys.all() },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.filter((post) => post.id !== id),
            })),
          },
      );

      return { snapshot };
    },

    onError: (_error, _variables, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
      toast.error("The post could not be deleted");
    },

    onSuccess: () => toast.success("Post deleted"),
  });
};
