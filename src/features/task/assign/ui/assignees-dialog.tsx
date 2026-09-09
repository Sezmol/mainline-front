import { useState } from "react";

import { UserPlusIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import type { Post } from "@entities/post";
import { teamQueries } from "@entities/team";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { useAssign, useUnassign } from "../model/use-assign";

type Task = Extract<Post, { type: "task" }>;

interface AssigneesDialogProps {
  task: Task;
  teamId: string;
}

export const AssigneesDialog = ({ task, teamId }: AssigneesDialogProps) => {
  const [open, setOpen] = useState(false);

  const members = useQuery({ ...teamQueries.members(teamId), enabled: open });
  const assign = useAssign(task.id, task.projectId);
  const unassign = useUnassign(task.id, task.projectId);

  const taken = new Set(task.assignees.map((user) => user.id));
  const free = (members.data ?? []).filter(
    (member) => !taken.has(member.user.id),
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <UserPlusIcon className="size-3.5" />
        Assignees
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Who works on this</DialogTitle>
            <DialogDescription>
              Only people already on the team. A task with somebody on it stops
              being public.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-2">
              <h3 className="text-muted-foreground font-mono text-[11px] tracking-wide uppercase">
                On the task
              </h3>

              {task.assignees.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nobody yet.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {task.assignees.map((user) => (
                    <li
                      key={user.id}
                      className="border-border flex items-center gap-2 rounded-lg border px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm">
                        {user.firstName} {user.lastName}
                        <span className="text-muted-foreground font-mono text-xs">
                          {" "}
                          @{user.nickname}
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive ml-auto"
                        aria-label={`Take @${user.nickname} off`}
                        disabled={unassign.isPending}
                        onClick={() => unassign.mutate(user.id)}
                      >
                        <XIcon className="size-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-muted-foreground font-mono text-[11px] tracking-wide uppercase">
                On the team
              </h3>

              {free.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Everybody on the team is already on this task.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {free.map((member) => (
                    <li
                      key={member.user.id}
                      className="border-border flex items-center gap-2 rounded-lg border px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm">
                        {member.user.firstName} {member.user.lastName}
                        <span className="text-muted-foreground font-mono text-xs">
                          {" "}
                          @{member.user.nickname}
                        </span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto font-mono text-xs"
                        disabled={assign.isPending}
                        onClick={() => assign.mutate(member.user.id)}
                      >
                        Assign
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
