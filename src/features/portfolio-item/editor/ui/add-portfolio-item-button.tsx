import { useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { Button } from "@shared/ui/button";

import { PortfolioItemFormDialog } from "./portfolio-item-form-dialog";

export const AddPortfolioItemButton = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        className="font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-3.5" />
        Add item
      </Button>

      <PortfolioItemFormDialog
        open={open}
        onOpenChange={setOpen}
        userId={userId}
      />
    </>
  );
};
