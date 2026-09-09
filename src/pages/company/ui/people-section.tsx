import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { RemoveMemberButton } from "@features/company/remove-member";
import { RoleSelect } from "@features/company/set-role";
import { TransferOwnershipButton } from "@features/company/transfer-ownership";

import {
  byRole,
  type CompanyPage,
  companyQueries,
  type CompanyViewer,
  MemberRow,
} from "@entities/company";
import { sessionQueries } from "@entities/session";

import { useIntersection } from "@shared/lib/use-intersection";
import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import { Spinner } from "@shared/ui/spinner";

interface PeopleSectionProps {
  company: CompanyPage;
  viewer: CompanyViewer;
}

export const PeopleSection = ({ company, viewer }: PeopleSectionProps) => {
  const staff = useInfiniteQuery(companyQueries.members(company.id));
  const { data: session } = useQuery(sessionQueries.current());

  const sentinelRef = useIntersection<HTMLButtonElement>(
    () => void staff.fetchNextPage(),
    staff.hasNextPage && !staff.isFetchingNextPage,
  );

  if (staff.isPending) {
    return (
      <p className="text-muted-foreground py-6 text-center font-mono text-xs">
        Loading the staff list…
      </p>
    );
  }

  if (staff.isError) {
    return (
      <ErrorState
        message="The staff list could not be loaded."
        onRetry={() => void staff.refetch()}
      />
    );
  }

  const isOwner = viewer.role === "owner";
  const isStaff = isOwner || viewer.role === "hr";

  const members = staff.data.pages.flatMap((page) => page.items).sort(byRole);

  return (
    <div className="flex flex-col gap-4">
      <ul className="border-border bg-card flex flex-col rounded-lg border px-4 py-1">
        {members.map((member) => {
          const isSelf = member.user.id === session?.id;
          const removable =
            member.role !== "owner" &&
            (isSelf ||
              (isStaff && !(viewer.role === "hr" && member.role === "hr")));

          return (
            <MemberRow
              key={member.user.id}
              member={member}
              role={
                isOwner && !isSelf ? (
                  <RoleSelect
                    companyId={company.id}
                    userId={member.user.id}
                    role={member.role}
                  />
                ) : undefined
              }
              actions={
                <>
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

      {staff.hasNextPage ? (
        <Button
          ref={sentinelRef}
          variant="outline"
          className="font-mono text-xs"
          disabled={staff.isFetchingNextPage}
          onClick={() => void staff.fetchNextPage()}
        >
          {staff.isFetchingNextPage ? (
            <>
              <Spinner />
              Loading
            </>
          ) : (
            "Load more"
          )}
        </Button>
      ) : null}
    </div>
  );
};
