import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { COMPANY_ROLE_LABELS } from "@shared/config";
import { formatRelativeTime } from "@shared/lib/format-relative-time";

import type { Invite } from "../invite.types";

const SCOPE_LABELS = {
  company: "company",
  department: "department",
  team: "team",
} as const;

interface InviteCardProps {
  invite: Invite;
  direction?: "incoming" | "outgoing";
  actions?: ReactNode;
}

export const InviteCard = ({
  invite,
  direction = "incoming",
  actions,
}: InviteCardProps) => {
  const person = direction === "incoming" ? invite.inviter : invite.invitee;

  return (
    <li className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
      <p className="text-sm leading-relaxed">
        <span className="font-medium">
          {person.firstName} {person.lastName}
        </span>{" "}
        <span className="text-muted-foreground">
          {direction === "incoming"
            ? `invited you to the ${SCOPE_LABELS[invite.scope]}`
            : `is invited to the ${SCOPE_LABELS[invite.scope]}`}
        </span>{" "}
        {invite.target.companySlug ? (
          <Link
            to="/c/$slug"
            params={{ slug: invite.target.companySlug }}
            search={{ tab: "overview" as const }}
            className="hover:text-primary font-medium underline-offset-4 transition-colors hover:underline"
          >
            {invite.target.name}
          </Link>
        ) : (
          <span className="font-medium">{invite.target.name}</span>
        )}
        {invite.role ? (
          <span className="text-muted-foreground">
            {" "}
            as {COMPANY_ROLE_LABELS[invite.role]}
          </span>
        ) : null}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground font-mono text-[11px]">
          {formatRelativeTime(invite.createdAt)}
        </span>

        <div className="ml-auto flex flex-wrap gap-2">{actions}</div>
      </div>
    </li>
  );
};
