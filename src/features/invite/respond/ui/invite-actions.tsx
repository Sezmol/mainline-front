import type { Invite } from "@entities/invite";

import { Button } from "@shared/ui/button";

import { useDecideInvite } from "../model/use-decide-invite";

export const InviteActions = ({ invite }: { invite: Invite }) => {
  const decide = useDecideInvite();

  return (
    <>
      <Button
        size="sm"
        disabled={decide.isPending}
        onClick={() =>
          decide.mutate({ inviteId: invite.id, decision: "accepted" })
        }
      >
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={decide.isPending}
        onClick={() =>
          decide.mutate({ inviteId: invite.id, decision: "declined" })
        }
      >
        Decline
      </Button>
    </>
  );
};
