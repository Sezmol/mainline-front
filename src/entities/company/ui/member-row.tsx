import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@shared/ui/avatar";

import type { Member } from "../company.types";
import { RoleBadge } from "./role-badge";

interface MemberRowProps {
  member: Member;
  role?: ReactNode;
  actions?: ReactNode;
}

export const MemberRow = ({ member, role, actions }: MemberRowProps) => (
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
        @{member.user.nickname}
      </span>
    </div>

    <div className="flex w-32 shrink-0 items-center">
      {role ?? <RoleBadge role={member.role} />}
    </div>

    <div className="flex w-52 shrink-0 flex-wrap items-center justify-end gap-2">
      {actions}
    </div>
  </li>
);
