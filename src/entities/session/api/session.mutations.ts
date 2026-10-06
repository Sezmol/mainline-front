import { useMutation } from "@tanstack/react-query";

import {
  authControllerLogin,
  authControllerLogout,
  authControllerRegister,
  type LoginDto,
  type RegisterDto,
} from "@shared/api";

export const useSignUp = () =>
  useMutation({
    mutationFn: async (body: RegisterDto) => {
      const { data } = await authControllerRegister({
        body,
        throwOnError: true,
      });
      return data;
    },
  });

export const useSignIn = () =>
  useMutation({
    mutationFn: async (body: LoginDto) => {
      const { data } = await authControllerLogin({ body, throwOnError: true });
      return data;
    },
  });

export const useSignOut = () =>
  useMutation({
    mutationFn: async () => {
      await authControllerLogout({ throwOnError: true });
    },
  });
