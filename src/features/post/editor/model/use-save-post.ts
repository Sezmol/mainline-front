import {
  type InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { type Post, postKeys, type PostPage } from "@entities/post";
import { sessionQueries } from "@entities/session";

import { postsControllerCreate, postsControllerUpdate } from "@shared/api";

import type { PostFormValues } from "./post-form.schema";
type FeedData = InfiniteData<PostPage> | undefined;

const OPTIMISTIC_PREFIX = "optimistic-";

export const isOptimistic = (post: Post) =>
  post.id.startsWith(OPTIMISTIC_PREFIX);

const mapPages = (data: FeedData, map: (items: Post[]) => Post[]): FeedData =>
  data && {
    ...data,
    pages: data.pages.map((page) => ({ ...page, items: map(page.items) })),
  };

const prepend = (data: FeedData, post: Post): FeedData =>
  data && {
    ...data,
    pages: data.pages.map((page, index) =>
      index === 0 ? { ...page, items: [post, ...page.items] } : page,
    ),
  };

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery(sessionQueries.current());

  const patch = (map: (items: Post[]) => Post[]) =>
    queryClient.setQueriesData<InfiniteData<PostPage>>(
      { queryKey: postKeys.all() },
      (data) => mapPages(data, map),
    );

  return useMutation({
    mutationFn: async (values: PostFormValues) => {
      const { data } = await postsControllerCreate({
        body: values,
        throwOnError: true,
      });
      return data;
    },

    onMutate: (values) => {
      if (!user) return { id: null };

      const id = `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      queryClient.setQueriesData<InfiniteData<PostPage>>(
        { queryKey: postKeys.all() },
        (data) =>
          prepend(data, {
            id,
            type: "content",
            direction: values.direction,
            title: values.title,
            body: values.body,
            author: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              nickname: user.nickname,
              speciality: user.speciality,
              role: user.role,
              ...(user.description ? { description: user.description } : {}),
              ...(user.workplace ? { workplace: user.workplace } : {}),
            },
            likeCount: 0,
            likedByMe: false,
            createdAt: now,
            updatedAt: now,
          }),
      );

      return { id };
    },

    onSuccess: (created, _values, context) => {
      patch((items) =>
        context.id
          ? items.map((item) => (item.id === context.id ? created : item))
          : [created, ...items],
      );
    },

    onError: (_error, _values, context) => {
      patch((items) => items.filter((item) => item.id !== context?.id));
    },
  });
};

export const useUpdatePost = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PostFormValues) => {
      const { data } = await postsControllerUpdate({
        path: { id },
        body: values,
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (updated) => {
      queryClient.setQueriesData<InfiniteData<PostPage>>(
        { queryKey: postKeys.all() },
        (data) =>
          mapPages(data, (items) =>
            items.map((item) => (item.id === id ? updated : item)),
          ),
      );
    },
  });
};
