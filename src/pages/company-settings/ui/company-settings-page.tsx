import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { CompanyForm } from "@features/company/editor";
import { CreateTeamButton } from "@features/team/editor";

import { companyQueries } from "@entities/company";
import { teamQueries } from "@entities/team";
import { TeamCard } from "@entities/team";

import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";

import { settingsRoute } from "../model/settings-route";
import { DepartmentsSettings } from "./departments-settings";
import { PeopleSettings } from "./people-settings";
import { SettingsTabs } from "./settings-tabs";

export const CompanySettingsPage = () => {
  const { slug } = settingsRoute.useParams();
  const { tab } = settingsRoute.useSearch();

  const company = useQuery(companyQueries.page(slug));
  const teams = useQuery({
    ...teamQueries.mine(company.data?.id),
    enabled: tab === "teams" && Boolean(company.data),
  });

  if (company.isPending) {
    return (
      <p className="text-muted-foreground py-10 text-center font-mono text-xs">
        Loading…
      </p>
    );
  }

  if (company.isError) {
    return (
      <ErrorState
        message="These settings could not be loaded."
        onRetry={() => void company.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground self-start font-mono text-xs"
          nativeButton={false}
          render={
            <Link
              to="/c/$slug"
              params={{ slug }}
              search={{ tab: "overview" as const }}
            />
          }
        >
          <ArrowLeftIcon className="size-3.5" />
          {company.data.name}
        </Button>

        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      </header>

      <SettingsTabs current={tab} slug={slug} />

      {tab === "profile" ? (
        <div className="border-border bg-card rounded-lg border p-4">
          <CompanyForm company={company.data} submitLabel="Save changes" />
        </div>
      ) : null}

      {tab === "people" ? <PeopleSettings company={company.data} /> : null}

      {tab === "departments" ? (
        <DepartmentsSettings company={company.data} />
      ) : null}

      {tab === "teams" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">
              Teams you belong to in this company.
            </p>
            <CreateTeamButton companyId={company.data.id} />
          </div>

          {teams.data && teams.data.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {teams.data.map((team) => (
                <TeamCard key={team.id} team={team} mine hideCompany />
              ))}
            </ul>
          ) : (
            <p className="border-border text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              No teams yet. A team can pull people from any department.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};
