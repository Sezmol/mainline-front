import { MapPinIcon, UsersIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { cn } from "@shared/lib/cn";

import type { CompanyCard as CompanyCardModel } from "../company.types";
import { CompanyLogo } from "./company-logo";

interface CompanyCardProps {
  company: CompanyCardModel;
  mine?: boolean;
}

export const CompanyCard = ({ company, mine }: CompanyCardProps) => (
  <li
    className={cn(
      "border-border bg-card hover:border-primary/40 flex min-w-0 items-center gap-4 rounded-lg border p-4 transition-colors",
      mine && "border-primary/40 bg-primary/5",
    )}
  >
    <CompanyLogo name={company.name} logoUrl={company.logoUrl} />

    <div className="flex min-w-0 flex-col gap-1">
      <h3 className="truncate text-sm font-semibold tracking-tight">
        <Link
          to="/c/$slug"
          params={{ slug: company.slug }}
          search={{ tab: "overview" as const }}
          className="hover:text-primary transition-colors"
        >
          {company.name}
        </Link>
      </h3>

      <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums">
        <span className="inline-flex items-center gap-1">
          <UsersIcon className="size-3" />
          {company.employeeCount}
        </span>

        {company.location ? (
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPinIcon className="size-3 shrink-0" />
            <span className="truncate">{company.location}</span>
          </span>
        ) : null}

        <span className="truncate">/c/{company.slug}</span>
      </p>
    </div>
  </li>
);
