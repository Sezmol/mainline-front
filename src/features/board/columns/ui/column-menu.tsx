import { useState } from "react";

import { arrayMove } from "@dnd-kit/sortable";
import {
  CaretLeftIcon,
  CaretRightIcon,
  PencilIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import type { BoardColumn } from "@entities/project";

import { Button } from "@shared/ui/button";

import { useRemoveColumn, useReorderColumns } from "../model/use-columns";
import { ColumnFormDialog } from "./column-form-dialog";

interface ColumnMenuProps {
  projectId: string;
  column: BoardColumn;
  columns: BoardColumn[];
}

export const ColumnMenu = ({ projectId, column, columns }: ColumnMenuProps) => {
  const [editing, setEditing] = useState(false);
  const remove = useRemoveColumn(projectId);
  const reorder = useReorderColumns(projectId);

  const ids = columns.map((item) => item.id);
  const index = ids.indexOf(column.id);
  const last = columns.length <= 1;

  return (
    <>
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Move ${column.name} left`}
          disabled={index <= 0}
          onClick={() => reorder.mutate(arrayMove(ids, index, index - 1))}
        >
          <CaretLeftIcon className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Move ${column.name} right`}
          disabled={index === ids.length - 1}
          onClick={() => reorder.mutate(arrayMove(ids, index, index + 1))}
        >
          <CaretRightIcon className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Rename ${column.name}`}
          onClick={() => setEditing(true)}
        >
          <PencilIcon className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${column.name}`}
          className="text-muted-foreground hover:text-destructive"
          disabled={last}
          onClick={() => remove.mutate(column.id)}
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </div>

      <ColumnFormDialog
        open={editing}
        onOpenChange={setEditing}
        projectId={projectId}
        column={column}
      />
    </>
  );
};
