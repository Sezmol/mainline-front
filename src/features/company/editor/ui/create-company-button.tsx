import { useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

import { CompanyForm } from "./company-form";

export const CreateCompanyButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="size-3.5" />
        New company
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New company</DialogTitle>
            <DialogDescription>
              You become its owner, and it starts with a Managers department.
            </DialogDescription>
          </DialogHeader>

          <CompanyForm
            submitLabel="Create company"
            stickyActions
            onSaved={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
