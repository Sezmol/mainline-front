import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { notificationsControllerMarkAllRead } from "@shared/api";

import type { NotificationPage } from "../notification.types";
import { notificationKeys } from "./notification.queries";

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      notificationsControllerMarkAllRead({ throwOnError: true }),

    onSuccess: () => {
      queryClient.setQueryData<NotificationPage>(
        notificationKeys.badge(),
        (page) => page && { ...page, unreadCount: 0 },
      );

      queryClient.setQueryData<InfiniteData<NotificationPage>>(
        notificationKeys.list(),
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({ ...page, unreadCount: 0 })),
          },
      );
    },
  });
};
