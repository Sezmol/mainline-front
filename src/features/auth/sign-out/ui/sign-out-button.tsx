import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";

import { useSignOut } from "@entities/session";

import { Button } from "@shared/ui/button";

export const SignOutButton = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = useSignOut();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={signOut.isPending}
      onClick={() => {
        signOut.mutate(undefined, {
          onSettled: () => {
            void navigate({ to: "/login" }).then(() => {
              queryClient.removeQueries({
                predicate: (query) => query.queryKey[0] !== "session",
              });
            });
          },
        });
      }}
    >
      <LogOutIcon />
      Sign out
    </Button>
  );
};
