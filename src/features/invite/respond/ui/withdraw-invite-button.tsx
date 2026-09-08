import { XIcon } from "@phosphor-icons/react";

import type { Invite } from "@entities/invite";

import { Button } from "@shared/ui/button";

import { useWithdrawInvite } from "../model/use-withdraw-invite";

export const WithdrawInviteButton = ({ invite }: { invite: Invite }) => {
  const withdraw = useWithdrawInvite();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive font-mono text-xs"
      disabled={withdraw.isPending}
      onClick={() => withdraw.mutate(invite.id)}
    >
      <XIcon className="size-3.5" />
      Withdraw
    </Button>
  );
};
