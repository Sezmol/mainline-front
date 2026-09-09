import { Skeleton } from "@shared/ui/skeleton";

const COLUMNS = [0, 1, 2];
const CARDS = [0, 1, 2];

export const TaskBoardSkeleton = () => (
  <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0" role="status">
    <span className="sr-only">Loading the board</span>

    <div className="flex min-w-max gap-3 py-2">
      {COLUMNS.map((column) => (
        <section
          key={column}
          className="bg-elevated/60 flex w-72 shrink-0 flex-col gap-2 rounded-lg p-2.5"
        >
          <header className="flex items-center gap-2 px-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="ml-auto h-3.5 w-5" />
          </header>

          <ul className="flex flex-col gap-2">
            {CARDS.map((card) => (
              <li
                key={card}
                className="border-border bg-card flex flex-col gap-2 rounded-lg border p-3"
              >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  </div>
);
