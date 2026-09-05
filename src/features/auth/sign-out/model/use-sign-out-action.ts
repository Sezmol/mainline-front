import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useSignOut } from "@entities/session";

export const useSignOutAction = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = useSignOut();

  return {
    isPending: signOut.isPending,
    signOut: () => {
      signOut.mutate(undefined, {
        onSettled: () => {
          void navigate({ to: "/login" }).then(() => {
            queryClient.removeQueries({
              predicate: (query) => query.queryKey[0] !== "session",
            });
          });
        },
      });
    },
  };
};
