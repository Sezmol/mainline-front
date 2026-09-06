import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";
import { countLabel } from "@shared/lib/count-label";

import type { Team } from "../team.types";

interface TeamCardProps {
  team: Team;
  mine?: boolean;
  hideCompany?: boolean;
  actions?: ReactNode;
}

const CompanyLabel = ({ team }: { team: Team }) => {
  if (!team.companySlug || !team.companyName) {
    return (
      <>
        <span>·</span>
        <span>independent</span>
      </>
    );
  }

  return (
    <>
      <span>·</span>
      <Link
        to="/c/$slug"
        params={{ slug: team.companySlug }}
        search={{ tab: "overview" as const }}
        className="hover:text-primary truncate transition-colors"
      >
        {team.companyName}
      </Link>
    </>
  );
};

export const TeamCard = ({
  team,
  mine,
  hideCompany,
  actions,
}: TeamCardProps) => (
  <li
    className={cn(
      "border-border bg-card flex min-w-0 flex-wrap items-center gap-3 rounded-lg border p-4",
      mine && "border-primary/40 bg-primary/5",
    )}
  >
    <div className="flex min-w-0 flex-col gap-0.5">
      <h3 className="truncate text-sm font-semibold tracking-tight">
        <Link
          to="/t/$teamId"
          params={{ teamId: team.id }}
          className="hover:text-primary transition-colors"
        >
          {team.name}
        </Link>
      </h3>

      <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 font-mono text-[11px] tabular-nums">
        <span>lead @{team.manager.nickname}</span>
        <span>·</span>
        <span>{countLabel(team.memberCount, "person", "people")}</span>
        {hideCompany ? null : <CompanyLabel team={team} />}
      </p>
    </div>

    <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>
  </li>
);
