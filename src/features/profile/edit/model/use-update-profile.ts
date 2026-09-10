import { useMutation, useQueryClient } from "@tanstack/react-query";

import { portfolioItemKeys } from "@entities/portfolio-item";
import { postKeys } from "@entities/post";
import { sessionKeys } from "@entities/session";
import { type Profile, userKeys } from "@entities/user";

import { usersControllerUpdate } from "@shared/api";

import { type ProfileFormValues, toUpdateBody } from "./profile-form.schema";

export const useUpdateProfile = (profile: Profile) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { data } = await usersControllerUpdate({
        path: { id: profile.id },
        body: toUpdateBody(values),
        throwOnError: true,
      });
      return data;
    },

    onSuccess: (user) => {
      queryClient.setQueryData(sessionKeys.current(), user);

      queryClient.setQueryData<Profile>(userKeys.profile(user.nickname), {
        id: profile.id,
        createdAt: profile.createdAt,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        speciality: user.speciality,
        role: user.role,
        ...(user.description ? { description: user.description } : {}),
        ...(user.workplace ? { workplace: user.workplace } : {}),
      });

      if (user.nickname !== profile.nickname) {
        queryClient.removeQueries({
          queryKey: userKeys.profile(profile.nickname),
        });
      }

      void queryClient.invalidateQueries({ queryKey: postKeys.all() });
      void queryClient.invalidateQueries({
        queryKey: portfolioItemKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: portfolioItemKeys.details(),
      });
    },
  });
};
