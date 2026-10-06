import { useSignOut } from "@entities/session";

import { switchSession } from "@shared/lib/session-switch";

export const useSignOutAction = () => {
  const signOut = useSignOut();

  return {
    isPending: signOut.isPending,
    signOut: () => {
      signOut.mutate(undefined, {
        onSettled: () => switchSession("/login"),
      });
    },
  };
};
