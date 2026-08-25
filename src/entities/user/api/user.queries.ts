import { queryOptions } from '@tanstack/react-query';

import { usersControllerCheckAvailability } from '@shared/api/generated';

export interface AvailabilityParams {
  nickname?: string;
  email?: string;
}

export const userKeys = {
  root: ['users'] as const,
  availability: (params: AvailabilityParams) =>
    [...userKeys.root, 'availability', params] as const,
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
};
