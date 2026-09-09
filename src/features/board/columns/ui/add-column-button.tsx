import { useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";

import { ColumnFormDialog } from "./column-form-dialog";

export const AddColumnButton = ({ projectId }: { projectId: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-3.5" />
        Column
      </Button>

      <ColumnFormDialog
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
      />
    </>
  );
};
