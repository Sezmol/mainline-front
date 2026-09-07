import { ChatIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { CreateTeamButton } from "@features/team/editor";

import { useDockStore } from "@entities/chat";
import type {
  CompanyPage,
  CompanyViewer,
  ContainerRef,
} from "@entities/company";
import { DepartmentCard, departmentQueries } from "@entities/department";
import { TeamCard, teamQueries } from "@entities/team";

import { Button } from "@shared/ui/button";
import { ErrorState } from "@shared/ui/error-state";

interface StructureSectionProps {
  company: CompanyPage;
  viewer: CompanyViewer;
}

const OpenChatButton = ({ chatId }: { chatId: string }) => (
  <Button
    variant="ghost"
    size="sm"
    className="text-muted-foreground hover:text-foreground font-mono text-xs"
    onClick={() => useDockStore.getState().openChat(chatId)}
  >
    <ChatIcon className="size-3.5" />
    Chat
  </Button>
);

const chatOf = (refs: ContainerRef[], id: string) =>
  refs.find((ref) => ref.id === id)?.chatId ?? null;

export const StructureSection = ({
  company,
  viewer,
}: StructureSectionProps) => {
  const departments = useQuery(departmentQueries.list(company.id));
  const teams = useQuery(teamQueries.mine(company.id));

  const canCreateTeam =
    viewer.role === "owner" ||
    viewer.role === "hr" ||
    viewer.role === "manager";

  const canManage = viewer.role === "owner" || viewer.role === "hr";

  if (departments.isError) {
    return (
      <ErrorState
        message="The structure could not be loaded."
        onRetry={() => void departments.refetch()}
      />
    );
  }

  const mineDepartments = new Set(viewer.departments.map((ref) => ref.id));
  const sortedDepartments = [...(departments.data ?? [])].sort(
    (a, b) =>
      Number(mineDepartments.has(b.id)) - Number(mineDepartments.has(a.id)),
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
          <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
            Departments
          </h2>
        </div>

        {sortedDepartments.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {sortedDepartments.map((department) => {
              const chatId = chatOf(viewer.departments, department.id);

              return (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  mine={mineDepartments.has(department.id)}
                  actions={chatId ? <OpenChatButton chatId={chatId} /> : null}
                />
              );
            })}
          </ul>
        ) : (
          <p className="border-border text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            No departments yet.
            {canManage ? " Add the first one from settings." : null}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
          <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
            Your teams
          </h2>
          {canCreateTeam ? <CreateTeamButton companyId={company.id} /> : null}
        </div>

        {teams.data && teams.data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {teams.data.map((team) => {
              const chatId = chatOf(viewer.teams, team.id);

              return (
                <TeamCard
                  key={team.id}
                  team={team}
                  mine
                  hideCompany
                  actions={chatId ? <OpenChatButton chatId={chatId} /> : null}
                />
              );
            })}
          </ul>
        ) : (
          <p className="border-border text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            You are not in a team here.
            {canCreateTeam
              ? " A team can pull people from any department."
              : null}
          </p>
        )}
      </section>
    </div>
  );
};
