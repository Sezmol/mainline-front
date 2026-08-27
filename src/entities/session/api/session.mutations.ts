import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  authControllerLogin,
  authControllerLogout,
  authControllerRegister,
  type LoginDto,
  type RegisterDto,
} from "@shared/api";

import { sessionKeys } from "./session.queries";

export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: RegisterDto) => {
      const { data } = await authControllerRegister({
        body,
        throwOnError: true,
      });
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(sessionKeys.current(), user);
    },
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: LoginDto) => {
      const { data } = await authControllerLogin({ body, throwOnError: true });
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(sessionKeys.current(), user);
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authControllerLogout({ throwOnError: true });
    },
    onSettled: () => {
      queryClient.setQueryData(sessionKeys.current(), null);
    },
  });
};
