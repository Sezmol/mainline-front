import {
  type ComponentPropsWithRef,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";

import { cn } from "@shared/lib/cn";

import type { BoardColumn } from "../project.types";

interface BoardTask {
  id: string;
  status: string;
}

type DragData =
  { kind: "task"; status: string } | { kind: "column"; name: string };

const dragData = (data: { current: unknown }) =>
  data.current as DragData | undefined;

export interface DragHandlers extends ComponentPropsWithRef<"li"> {
  dragging?: boolean;
  grabbable?: boolean;
}

type RenderCard<T extends BoardTask> = (
  task: T,
  drag: DragHandlers,
) => ReactNode;

interface TaskBoardProps<T extends BoardTask> {
  columns: BoardColumn[];
  tasks: T[];
  renderCard: RenderCard<T>;
  renderColumnActions?: (column: BoardColumn) => ReactNode;
  onMove?: (taskId: string, status: string) => void;
  onReorder?: (columnIds: string[]) => void;
  empty?: ReactNode;
}

const DraggableTask = <T extends BoardTask>({
  task,
  enabled,
  render,
}: {
  task: T;
  enabled: boolean;
  render: RenderCard<T>;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { kind: "task", status: task.status },
    disabled: !enabled,
  });

  return render(task, {
    ref: setNodeRef,
    dragging: isDragging,
    grabbable: enabled,
    style: { touchAction: "manipulation" },
    ...attributes,
    ...listeners,
  });
};

const Column = ({
  column,
  reorderable,
  actions,
  count,
  children,
}: {
  column: BoardColumn;
  reorderable: boolean;
  actions?: ReactNode;
  count: number;
  children: ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: column.id,
    data: { kind: "column", name: column.name },
    disabled: !reorderable,
    animateLayoutChanges: () => false,
  });

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "bg-elevated/60 flex w-72 shrink-0 flex-col gap-2 rounded-lg p-2.5 transition-colors",
        isOver && !isDragging && "bg-primary/10 ring-primary/40 ring-1",
        isDragging && "opacity-40",
      )}
    >
      <header className="flex items-center gap-2 px-1">
        <div
          {...(reorderable ? { ...attributes, ...listeners } : {})}
          className={cn(
            "flex min-w-0 items-center gap-2",
            reorderable &&
              "cursor-grab touch-manipulation active:cursor-grabbing",
          )}
        >
          {reorderable ? (
            <DotsSixVerticalIcon className="text-muted-foreground size-3.5 shrink-0" />
          ) : null}

          <h3
            title={column.name}
            className="text-muted-foreground truncate font-mono text-[11px] tracking-widest uppercase"
          >
            {column.name}
          </h3>
          <span className="text-muted-foreground shrink-0 font-mono text-[11px] tabular-nums">
            {count}
          </span>
        </div>

        <div className="ml-auto shrink-0">{actions}</div>
      </header>

      {children}
    </section>
  );
};

export const TaskBoard = <T extends BoardTask>({
  columns,
  tasks,
  renderCard,
  renderColumnActions,
  onMove,
  onReorder,
  empty,
}: TaskBoardProps<T>) => {
  const [dragged, setDragged] = useState<T | null>(null);
  const [moved, setMoved] = useState<{ id: string; status: string } | null>(
    null,
  );

  const [reordered, setReordered] = useState<{
    of: BoardColumn[];
    ids: string[];
  } | null>(null);

  useEffect(() => {
    if (!moved) return;

    const frame = requestAnimationFrame(() => setMoved(null));
    return () => cancelAnimationFrame(frame);
  }, [moved]);

  const shown =
    reordered?.of === columns
      ? reordered.ids
          .map((id) => columns.find((column) => column.id === id))
          .filter((column) => column !== undefined)
      : columns;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      if (dragData(active.data)?.kind !== "task") return;
      setDragged(tasks.find((task) => task.id === active.id) ?? null);
    },
    [tasks],
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDragged(null);
    if (!over) return;

    const source = dragData(active.data);
    const target = dragData(over.data);

    if (source?.kind === "task" && target?.kind === "column") {
      if (target.name !== source.status) {
        setMoved({ id: String(active.id), status: target.name });
        onMove?.(String(active.id), target.name);
      }
      return;
    }

    if (source?.kind === "column" && active.id !== over.id) {
      const ids = shown.map((item) => item.id);
      const from = ids.indexOf(String(active.id));
      const to = ids.indexOf(String(over.id));

      if (from !== -1 && to !== -1) {
        const next = arrayMove(ids, from, to);

        setReordered({ of: columns, ids: next });
        onReorder?.(next);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragged(null)}
    >
      <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3 py-2">
          <SortableContext
            items={shown.map((column) => column.id)}
            strategy={horizontalListSortingStrategy}
          >
            {shown.map((column) => {
              const inColumn = tasks.filter(
                (task) =>
                  (moved?.id === task.id ? moved.status : task.status) ===
                  column.name,
              );

              return (
                <Column
                  key={column.id}
                  column={column}
                  reorderable={Boolean(onReorder)}
                  actions={renderColumnActions?.(column)}
                  count={inColumn.length}
                >
                  <ul className="flex flex-col gap-2">
                    {inColumn.map((task) => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        enabled={Boolean(onMove)}
                        render={renderCard}
                      />
                    ))}
                  </ul>

                  {inColumn.length === 0 ? (
                    <p className="text-muted-foreground px-1 py-6 text-center font-mono text-[11px]">
                      Empty
                    </p>
                  ) : null}
                </Column>
              );
            })}
          </SortableContext>
        </div>

        {tasks.length === 0 && empty ? empty : null}
      </div>

      <DragOverlay wrapperElement="ul" dropAnimation={null}>
        {dragged
          ? renderCard(dragged, {
              grabbable: true,
              className: "ring-primary/40 shadow-lg ring-1",
            })
          : null}
      </DragOverlay>
    </DndContext>
  );
};
