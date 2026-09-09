import { useQuery } from "@tanstack/react-query";

import { InviteActions } from "@features/invite/respond";

import { InviteCard, inviteQueries } from "@entities/invite";

import { ErrorState } from "@shared/ui/error-state";

export const InvitesPage = () => {
  const invites = useQuery(inviteQueries.mine());

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
          Invitations
        </h1>
        <p className="text-body text-sm">Waiting for your answer.</p>
      </header>

      {invites.isError ? (
        <ErrorState
          message="Invitations could not be loaded."
          onRetry={() => void invites.refetch()}
        />
      ) : null}

      {invites.isPending ? (
        <p className="text-muted-foreground py-6 text-center font-mono text-xs">
          Loading…
        </p>
      ) : null}

      {invites.data && invites.data.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {invites.data.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              actions={<InviteActions invite={invite} />}
            />
          ))}
        </ul>
      ) : null}

      {invites.isSuccess && invites.data.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          Nothing yet. Invitations to companies, departments and teams land
          here.
        </p>
      ) : null}
    </div>
  );
};
