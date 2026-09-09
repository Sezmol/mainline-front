import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { CreateCompanyButton } from "@features/company/editor";

import { CompanyCardView, companyQueries } from "@entities/company";

import { useIntersection } from "@shared/lib/use-intersection";
import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import { Skeleton } from "@shared/ui/skeleton";
import { Spinner } from "@shared/ui/spinner";

import { companiesRoute } from "../model/companies-route";
import { CompanySearch } from "./company-search";

const SKELETON_ROWS = [0, 1, 2];

const CompanySkeleton = () => (
  <li className="border-border bg-card flex items-center gap-4 rounded-lg border p-4">
    <Skeleton className="size-12" />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-24" />
    </div>
  </li>
);

export const CompaniesPage = () => {
  const { q } = companiesRoute.useSearch();
  const list = useInfiniteQuery(companyQueries.directory(q));
  const mine = useQuery(companyQueries.mine());

  const sentinelRef = useIntersection<HTMLButtonElement>(
    () => void list.fetchNextPage(),
    list.hasNextPage && !list.isFetchingNextPage,
  );

  const mineIds = new Set((mine.data ?? []).map((company) => company.id));

  const companies = (list.data?.pages.flatMap((page) => page.items) ?? []).sort(
    (a, b) => Number(mineIds.has(b.id)) - Number(mineIds.has(a.id)),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
              Companies
            </h1>
            <p className="text-body text-sm">
              Teams hiring, building and publishing here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CompanySearch value={q} />
            <CreateCompanyButton />
          </div>
        </div>
      </header>

      {list.isError ? (
        <ErrorState
          message="Companies could not be loaded."
          onRetry={() => void list.refetch()}
        />
      ) : null}

      {list.isPending ? (
        <ul className="flex flex-col gap-3">
          {SKELETON_ROWS.map((row) => (
            <CompanySkeleton key={row} />
          ))}
        </ul>
      ) : null}

      {companies.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {companies.map((company) => (
            <CompanyCardView
              key={company.id}
              company={company}
              mine={mineIds.has(company.id)}
            />
          ))}
        </ul>
      ) : null}

      {list.isSuccess && companies.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          {q
            ? "No companies match that search."
            : "No companies yet. Create the first one."}
        </p>
      ) : null}

      {list.hasNextPage ? (
        <Button
          ref={sentinelRef}
          variant="outline"
          className="font-mono text-xs"
          disabled={list.isFetchingNextPage}
          onClick={() => void list.fetchNextPage()}
        >
          {list.isFetchingNextPage ? (
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
