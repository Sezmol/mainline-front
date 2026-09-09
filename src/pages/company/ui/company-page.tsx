import { ChatIcon, GearIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { useDockStore } from "@entities/chat";
import { CompanyHeader, companyQueries } from "@entities/company";

import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";
import { Skeleton } from "@shared/ui/skeleton";

import { companyRoute } from "../model/company-route";
import { MEMBER_TABS } from "../model/company-search";
import { CompanyOverview } from "./company-overview";
import { CompanyPosts } from "./company-posts";
import { CompanyTabs } from "./company-tabs";
import { PeopleSection } from "./people-section";
import { StructureSection } from "./structure-section";

const CompanySkeleton = () => (
  <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
    <Skeleton className="size-14" />
    <Skeleton className="h-5 w-48" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const CompanyPage = () => {
  const { slug } = companyRoute.useParams();
  const { tab } = companyRoute.useSearch();
  const company = useQuery(companyQueries.page(slug));

  if (company.isPending) return <CompanySkeleton />;

  if (company.isError) {
    return (
      <ErrorState
        message="This company could not be loaded."
        onRetry={() => void company.refetch()}
      />
    );
  }

  const { viewer } = company.data;
  const canManage = viewer?.role === "owner" || viewer?.role === "hr";
  const companyChatId = viewer?.companyChatId ?? null;

  const needsMembership = !viewer && MEMBER_TABS.has(tab);
  const active = needsMembership ? "overview" : tab;

  return (
    <div className="flex flex-col gap-6">
      <CompanyHeader
        company={company.data}
        actions={
          <>
            {companyChatId ? (
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                onClick={() => useDockStore.getState().openChat(companyChatId)}
              >
                <ChatIcon className="size-3.5" />
                Chat
              </Button>
            ) : null}

            {canManage ? (
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                nativeButton={false}
                render={
                  <Link
                    to="/c/$slug/settings"
                    params={{ slug }}
                    search={{ tab: "profile" as const }}
                  />
                }
              >
                <GearIcon className="size-3.5" />
                Settings
              </Button>
            ) : null}
          </>
        }
      />

      <CompanyTabs current={active} slug={slug} member={viewer !== null} />

      {active === "overview" ? (
        <CompanyOverview company={company.data} />
      ) : null}
      {active === "posts" ? (
        <CompanyPosts company={company.data} viewer={viewer} />
      ) : null}
      {active === "people" && viewer ? (
        <PeopleSection company={company.data} viewer={viewer} />
      ) : null}
      {active === "structure" && viewer ? (
        <StructureSection company={company.data} viewer={viewer} />
      ) : null}
    </div>
  );
};
