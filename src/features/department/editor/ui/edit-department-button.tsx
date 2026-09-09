import { useState } from "react";

import { PencilIcon } from "@phosphor-icons/react";

import type { Department } from "@entities/department";

import { Button } from "@shared/ui/button";

import { DepartmentFormDialog } from "./department-form-dialog";

export const EditDepartmentButton = ({
  department,
}: {
  department: Department;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
        Edit
      </Button>

      <DepartmentFormDialog
        open={open}
        onOpenChange={setOpen}
        companyId={department.companyId}
        department={department}
      />
    </>
  );
};
