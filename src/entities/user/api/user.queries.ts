import { queryOptions } from "@tanstack/react-query";

import {
  usersControllerByNicknameOptions,
  usersControllerByNicknameQueryKey,
  usersControllerCheckAvailability,
} from "@shared/api";

export interface AvailabilityParams {
  nickname?: string;
  email?: string;
}

const normalize = (nickname: string) => nickname.toLowerCase();

export const userKeys = {
  root: ["users"] as const,
  availability: (params: AvailabilityParams) =>
    [...userKeys.root, "availability", params] as const,
  profile: (nickname: string) =>
    usersControllerByNicknameQueryKey({
      path: { nickname: normalize(nickname) },
    }),
};

export const userQueries = {
  availability: (params: AvailabilityParams) =>
    queryOptions({
      queryKey: userKeys.availability(params),
      queryFn: async ({ signal }) => {
        const { data } = await usersControllerCheckAvailability({
          query: params,
          signal,
          throwOnError: true,
        });
        return data;
      },
      enabled: Boolean(params.nickname ?? params.email),
      staleTime: 30_000,
    }),

  profile: (nickname: string) =>
    usersControllerByNicknameOptions({
      path: { nickname: normalize(nickname) },
    }),
};
