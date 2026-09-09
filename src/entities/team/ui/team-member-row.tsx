import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { COMPANY_ROLE_LABELS } from "@shared/config";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Badge } from "@shared/ui/badge";

import type { TeamMember } from "../team.types";

interface TeamMemberRowProps {
  member: TeamMember;
  actions?: ReactNode;
}

export const TeamMemberRow = ({ member, actions }: TeamMemberRowProps) => (
  <li className="border-border flex flex-wrap items-center gap-3 border-b py-3 last:border-b-0">
    <Avatar className="size-9 shrink-0">
      <AvatarFallback className="font-mono text-[11px]">
        {member.user.firstName[0]}
        {member.user.lastName[0]}
      </AvatarFallback>
    </Avatar>

    <div className="flex min-w-40 flex-1 flex-col">
      <Link
        to="/u/$nickname"
        params={{ nickname: member.user.nickname }}
        className="hover:text-primary truncate text-sm font-medium transition-colors"
      >
        {member.user.firstName} {member.user.lastName}
      </Link>
      <span className="text-muted-foreground truncate font-mono text-[11px]">
        {[`@${member.user.nickname}`, ...member.departments].join(" · ")}
      </span>
    </div>

    <div className="flex w-32 shrink-0 items-center">
      {member.companyRole ? (
        <Badge variant="outline">
          {COMPANY_ROLE_LABELS[member.companyRole]}
        </Badge>
      ) : null}
    </div>

    <div className="flex w-52 shrink-0 flex-wrap items-center justify-end gap-2">
      {actions}
    </div>
  </li>
);
