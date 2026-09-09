import { SignOutIcon, UserMinusIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@shared/ui/button";

import { useRemoveFromTeam } from "../model/use-remove-from-team";

interface RemoveFromTeamButtonProps {
  teamId: string;
  userId: string;
  leaving?: boolean;
}

export const RemoveFromTeamButton = ({
  teamId,
  userId,
  leaving,
}: RemoveFromTeamButtonProps) => {
  const navigate = useNavigate();
  const remove = useRemoveFromTeam(teamId);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive font-mono text-xs"
      disabled={remove.isPending}
      onClick={() =>
        remove.mutate(userId, {
          onSuccess: () => {
            if (leaving) void navigate({ to: "/feed" });
          },
        })
      }
    >
      {leaving ? (
        <SignOutIcon className="size-3.5" />
      ) : (
        <UserMinusIcon className="size-3.5" />
      )}
      {leaving ? "Leave team" : "Remove"}
    </Button>
  );
};
