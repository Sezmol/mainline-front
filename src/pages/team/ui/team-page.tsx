import { ChatIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { InviteForm } from "@features/company/invite";
import { DisbandTeamButton, EditTeamButton } from "@features/team/editor";
import { RemoveFromTeamButton } from "@features/team/members";

import { useDockStore } from "@entities/chat";
import { sessionQueries } from "@entities/session";
import { TeamMemberRow, teamQueries } from "@entities/team";

import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";

import { teamRoute } from "../model/team-route";

export const TeamPage = () => {
  const { teamId } = teamRoute.useParams();

  const team = useQuery(teamQueries.byId(teamId));
  const members = useQuery(teamQueries.members(teamId));
  const { data: session } = useQuery(sessionQueries.current());

  if (team.isPending) {
    return (
      <p className="text-muted-foreground py-10 text-center font-mono text-xs">
        Loading…
      </p>
    );
  }

  if (team.isError) {
    return (
      <ErrorState
        message="This team could not be loaded."
        onRetry={() => void team.refetch()}
      />
    );
  }

  const isLead = team.data.manager.id === session?.id;
  const { chatId } = team.data;

  return (
    <div className="flex flex-col gap-6">
      <header className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-lg font-semibold tracking-tight wrap-anywhere">
              {team.data.name}
            </h1>

            <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 font-mono text-[11px] tabular-nums">
              <span>lead @{team.data.manager.nickname}</span>
              <span>·</span>
              <span>
                {team.data.memberCount}{" "}
                {team.data.memberCount === 1 ? "person" : "people"}
              </span>
              <span>·</span>
              {team.data.companySlug && team.data.companyName ? (
                <Link
                  to="/c/$slug"
                  params={{ slug: team.data.companySlug }}
                  search={{ tab: "overview" as const }}
                  className="hover:text-primary transition-colors"
                >
                  {team.data.companyName}
                </Link>
              ) : (
                <span>independent</span>
              )}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {chatId ? (
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                onClick={() => useDockStore.getState().openChat(chatId)}
              >
                <ChatIcon className="size-3.5" />
                Chat
              </Button>
            ) : null}

            {isLead ? (
              <>
                <EditTeamButton team={team.data} />
                <DisbandTeamButton team={team.data} />
              </>
            ) : null}
          </div>
        </div>

        {team.data.description ? (
          <p className="text-body text-sm leading-relaxed">
            {team.data.description}
          </p>
        ) : null}
      </header>

      {isLead ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
            Invite
          </h2>
          <InviteForm target={{ scope: "team", teamId }} />
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
          Members
        </h2>

        <ul className="flex flex-col">
          {(members.data ?? []).map((member) => {
            const isSelf = member.user.id === session?.id;
            const canRemove =
              member.user.id !== team.data.manager.id && (isLead || isSelf);

            return (
              <TeamMemberRow
                key={member.user.id}
                member={member}
                actions={
                  canRemove ? (
                    <RemoveFromTeamButton
                      teamId={teamId}
                      userId={member.user.id}
                      leaving={isSelf}
                    />
                  ) : null
                }
              />
            );
          })}
        </ul>
      </section>
    </div>
  );
};
