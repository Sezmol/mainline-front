import { useQuery } from "@tanstack/react-query";

import { InviteForm } from "@features/company/invite";
import {
  CreateDepartmentButton,
  DeleteDepartmentButton,
  EditDepartmentButton,
} from "@features/department/editor";

import type { CompanyPage } from "@entities/company";
import { departmentQueries } from "@entities/department";

import { ErrorState } from "@shared/ui/error-state";

export const DepartmentsSettings = ({ company }: { company: CompanyPage }) => {
  const departments = useQuery(departmentQueries.list(company.id));

  if (departments.isError) {
    return (
      <ErrorState
        message="Departments could not be loaded."
        onRetry={() => void departments.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          Each department has a head and a chat of its own.
        </p>
        <CreateDepartmentButton companyId={company.id} />
      </div>

      <ul className="flex flex-col gap-3">
        {(departments.data ?? []).map((department) => (
          <li
            key={department.id}
            className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h3 className="truncate text-sm font-semibold tracking-tight">
                  {department.name}
                </h3>
                <p className="text-muted-foreground font-mono text-[11px] tabular-nums">
                  {department.manager
                    ? `@${department.manager.nickname} · ${department.memberCount}`
                    : `no head · ${department.memberCount}`}
                </p>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-1">
                <EditDepartmentButton department={department} />
                <DeleteDepartmentButton department={department} />
              </div>
            </div>

            <InviteForm
              target={{
                scope: "department",
                companyId: company.id,
                departmentId: department.id,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
