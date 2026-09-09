import { useState } from "react";

import { CrownIcon } from "@phosphor-icons/react";

import type { Member } from "@entities/company";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { useTransferOwnership } from "../model/use-transfer-ownership";

interface TransferOwnershipButtonProps {
  companyId: string;
  slug: string;
  member: Member;
}

export const TransferOwnershipButton = ({
  companyId,
  slug,
  member,
}: TransferOwnershipButtonProps) => {
  const [open, setOpen] = useState(false);
  const transfer = useTransferOwnership(companyId, slug);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <CrownIcon className="size-3.5" />
        Make owner
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Hand the company to @{member.user.nickname}?
            </DialogTitle>
            <DialogDescription>
              You become a manager and lose access to these settings. Only the
              new owner can hand it back.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                transfer.mutate(member.user.id);
              }}
            >
              Hand over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
