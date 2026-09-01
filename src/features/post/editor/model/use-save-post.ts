import {
  type InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  optimisticPostId,
  type Post,
  postKeys,
  type PostPage,
} from "@entities/post";
import { sessionQueries } from "@entities/session";

import { postsControllerCreate, postsControllerUpdate } from "@shared/api";

import type { toPayload } from "./post-form.schema";

type PostPayload = ReturnType<typeof toPayload>;

type FeedData = InfiniteData<PostPage> | undefined;

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
    mutationFn: async (payload: PostPayload) => {
      const { data } = await postsControllerCreate({
        body: payload,
        throwOnError: true,
      });
      return data;
    },

    onMutate: (payload) => {
      if (!user) return { id: null };

      const id = optimisticPostId();
      const now = new Date().toISOString();

      const meta = {
        id,
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
        company: null,
        likeCount: 0,
        likedByMe: false,
        savedByMe: false,
        commentCount: 0,
        acceptedCount: 0,
        myInteraction: null,
        createdAt: now,
        updatedAt: now,
      };

      const optimistic: Post =
        payload.type === "task"
          ? { ...payload, ...meta, project: null, assignees: [] }
          : { ...payload, ...meta };

      queryClient.setQueriesData<InfiniteData<PostPage>>(
        { queryKey: postKeys.all() },
        (data) => prepend(data, optimistic),
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
    mutationFn: async (payload: PostPayload) => {
      const { data } = await postsControllerUpdate({
        path: { id },
        body: payload,
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
