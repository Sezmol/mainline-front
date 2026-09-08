import { createFileRoute } from "@tanstack/react-router";

import { InvitesPage } from "@pages/invites";

import { inviteQueries } from "@entities/invite";

export const Route = createFileRoute("/_app/invites")({
  loader: ({ context }) => context.queryClient.query(inviteQueries.mine()),
  component: InvitesPage,
});
