import { MapPinIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import type { CompanyPage } from "../company.types";
import { CompanyLogo } from "./company-logo";

interface CompanyHeaderProps {
  company: CompanyPage;
  actions?: ReactNode;
}

export const CompanyHeader = ({ company, actions }: CompanyHeaderProps) => (
  <header className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5">
    <div className="flex flex-wrap items-start gap-4">
      <CompanyLogo
        name={company.name}
        logoUrl={company.logoUrl}
        className="size-14"
      />

      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight wrap-anywhere">
          {company.name}
        </h1>
        <p className="text-muted-foreground truncate font-mono text-xs">
          /c/{company.slug}
        </p>
        {company.location ? (
          <p className="text-muted-foreground inline-flex items-center gap-1 font-mono text-[11px]">
            <MapPinIcon className="size-3" />
            {company.location}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>

    <dl className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] tabular-nums">
      <div className="flex items-center gap-1.5">
        <dt>employees</dt>
        <dd className="text-foreground">{company.employeeCount}</dd>
      </div>
      <div className="flex items-center gap-1.5">
        <dt>open roles</dt>
        <dd className="text-foreground">{company.vacancyCount}</dd>
      </div>
    </dl>
  </header>
);
