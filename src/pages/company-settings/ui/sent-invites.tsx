import { useQuery } from "@tanstack/react-query";

import { WithdrawInviteButton } from "@features/invite/respond";

import { InviteCard, inviteQueries } from "@entities/invite";

export const SentInvites = ({ slug }: { slug: string }) => {
  const sent = useQuery(inviteQueries.sent());
  const invites = (sent.data ?? []).filter(
    (invite) => invite.target.companySlug === slug,
  );

  if (invites.length === 0) {
    return (
      <p className="border-border text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
        Nobody is waiting for an answer.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {invites.map((invite) => (
        <InviteCard
          key={invite.id}
          invite={invite}
          direction="outgoing"
          actions={<WithdrawInviteButton invite={invite} />}
        />
      ))}
    </ul>
  );
};
