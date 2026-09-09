import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { InviteForm } from "@features/company/invite";
import { RemoveMemberButton } from "@features/company/remove-member";
import { RoleSelect } from "@features/company/set-role";
import { TransferOwnershipButton } from "@features/company/transfer-ownership";

import {
  byRole,
  type CompanyPage,
  companyQueries,
  MemberRow,
} from "@entities/company";
import { sessionQueries } from "@entities/session";

import { ErrorState } from "@shared/ui/error-state";

import { SentInvites } from "./sent-invites";

export const PeopleSettings = ({ company }: { company: CompanyPage }) => {
  const staff = useInfiniteQuery(companyQueries.members(company.id));
  const { data: session } = useQuery(sessionQueries.current());

  const role = company.viewer?.role;
  const isOwner = role === "owner";

  if (staff.isError) {
    return (
      <ErrorState
        message="The staff list could not be loaded."
        onRetry={() => void staff.refetch()}
      />
    );
  }

  const members = (staff.data?.pages.flatMap((page) => page.items) ?? []).sort(
    byRole,
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
          Invite
        </h2>
        <div className="border-border bg-card rounded-lg border p-4">
          <InviteForm
            target={{ scope: "company", companyId: company.id }}
            withRole
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
          Staff
        </h2>

        <ul className="border-border bg-card flex flex-col rounded-lg border px-4 py-1">
          {members.map((member) => {
            const isSelf = member.user.id === session?.id;
            const removable =
              member.role !== "owner" &&
              (isSelf || isOwner || (role === "hr" && member.role !== "hr"));

            return (
              <MemberRow
                key={member.user.id}
                member={member}
                actions={
                  <>
                    {isOwner && !isSelf ? (
                      <RoleSelect
                        companyId={company.id}
                        userId={member.user.id}
                        role={member.role}
                      />
                    ) : null}

                    {isOwner && !isSelf ? (
                      <TransferOwnershipButton
                        companyId={company.id}
                        slug={company.slug}
                        member={member}
                      />
                    ) : null}

                    {removable ? (
                      <RemoveMemberButton
                        companyId={company.id}
                        slug={company.slug}
                        member={member}
                        leaving={isSelf}
                      />
                    ) : null}
                  </>
                }
              />
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
          Waiting for an answer
        </h2>
        <SentInvites slug={company.slug} />
      </section>
    </div>
  );
};
