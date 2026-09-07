import { useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";

import { DepartmentFormDialog } from "./department-form-dialog";

export const CreateDepartmentButton = ({
  companyId,
}: {
  companyId: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="size-3.5" />
        New department
      </Button>

      <DepartmentFormDialog
        open={open}
        onOpenChange={setOpen}
        companyId={companyId}
      />
    </>
  );
};
