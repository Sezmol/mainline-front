import { useQuery } from "@tanstack/react-query";

import { DeletePortfolioItemButton } from "@features/portfolio-item/delete";
import {
  AddPortfolioItemButton,
  EditPortfolioItemButton,
} from "@features/portfolio-item/editor";

import {
  PortfolioItemCard,
  portfolioItemQueries,
} from "@entities/portfolio-item";

import { ErrorState } from "@shared/ui/error-state";
import { Skeleton } from "@shared/ui/skeleton";

const SKELETON_ROWS = [0, 1];

interface PortfolioSectionProps {
  userId: string;
  owned: boolean;
}

export const PortfolioSection = ({ userId, owned }: PortfolioSectionProps) => {
  const portfolio = useQuery(portfolioItemQueries.list(userId));

  const renderItems = () => {
    if (portfolio.isPending) {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {SKELETON_ROWS.map((row) => (
            <div
              key={row}
              className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4"
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (portfolio.isError) {
      return (
        <ErrorState
          message="The portfolio could not be loaded."
          onRetry={() => void portfolio.refetch()}
        />
      );
    }

    if (portfolio.data.length === 0) {
      return (
        <p className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          {owned
            ? "Nothing here yet. Add the first piece and it shows up on your profile."
            : "Nothing here yet."}
        </p>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {portfolio.data.map((item) => (
          <PortfolioItemCard
            key={item.id}
            item={item}
            actions={
              owned ? (
                <>
                  <EditPortfolioItemButton item={item} />
                  <DeletePortfolioItemButton item={item} />
                </>
              ) : undefined
            }
          />
        ))}
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
          Portfolio
          {portfolio.data && portfolio.data.length > 0 ? (
            <span className="ml-2 tabular-nums">{portfolio.data.length}</span>
          ) : null}
        </h2>

        {owned ? <AddPortfolioItemButton userId={userId} /> : null}
      </header>

      {renderItems()}
    </section>
  );
};
