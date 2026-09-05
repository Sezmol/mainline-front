import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { chatKeys } from "@entities/chat";

import { chatsControllerArchive } from "@shared/api";

export const useArchiveChat = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (archived: boolean) => {
      const { data } = await chatsControllerArchive({
        path: { id: chatId },
        body: { archived },
        throwOnError: true,
      });

      return data;
    },

    onSuccess: (view) => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.all() });
      queryClient.setQueryData(chatKeys.byId(chatId), view);
      toast.success(view.archived ? "Chat archived" : "Chat is back");
    },

    onError: () => toast.error("The chat could not be archived"),
  });
};
