import { useState } from "react";

import { PencilIcon } from "@phosphor-icons/react";

import type { PortfolioItem } from "@entities/portfolio-item";

import { Button } from "@shared/ui/button";

import { PortfolioItemFormDialog } from "./portfolio-item-form-dialog";

export const EditPortfolioItemButton = ({ item }: { item: PortfolioItem }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit item"
        className="text-muted-foreground font-mono text-xs"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
        Edit
      </Button>

      <PortfolioItemFormDialog
        open={open}
        onOpenChange={setOpen}
        userId={item.author.id}
        item={item}
      />
    </>
  );
};
