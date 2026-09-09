import { useState } from "react";

import { TrashIcon } from "@phosphor-icons/react";

import type { Team } from "@entities/team";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { useDisbandTeam } from "../model/use-save-team";

export const DisbandTeamButton = ({ team }: { team: Team }) => {
  const [open, setOpen] = useState(false);
  const disband = useDisbandTeam();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <TrashIcon className="size-3.5" />
        Disband
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disband “{team.name}”?</DialogTitle>
            <DialogDescription>
              The team and its chat disappear for everyone in it. Nobody leaves
              the company.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpen(false);
                disband.mutate(team.id);
              }}
            >
              Disband
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
