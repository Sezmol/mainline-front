import { LinkIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { PortfolioItem } from "../portfolio-item.types";

interface PortfolioItemCardProps {
  item: PortfolioItem;
  actions?: ReactNode;
}

export const PortfolioItemCard = ({
  item,
  actions,
}: PortfolioItemCardProps) => (
  <article className="border-border bg-card flex flex-col overflow-hidden rounded-lg border">
    {item.previewUrl ? (
      <img
        src={item.previewUrl}
        alt=""
        loading="lazy"
        className="border-border bg-elevated aspect-[16/9] w-full border-b object-cover"
      />
    ) : null}

    <div className="flex flex-1 flex-col gap-2 px-4 py-3.5">
      <h3 className="text-sm leading-snug font-semibold tracking-tight wrap-anywhere">
        <Link
          to="/u/$nickname/portfolio/$itemId"
          params={{
            nickname: item.author.nickname,
            itemId: item.id,
          }}
          className="hover:text-primary-ink transition-colors"
        >
          {item.title}
        </Link>
      </h3>

      {item.description ? (
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {item.description}
        </p>
      ) : null}

      {item.links.length > 0 ? (
        <p className="text-muted-foreground mt-auto inline-flex items-center gap-1.5 pt-1 font-mono text-[11px] tabular-nums">
          <LinkIcon className="size-3" />
          {item.links.length}
        </p>
      ) : null}
    </div>

    {actions ? (
      <footer className="border-border flex items-center gap-1 border-t px-3 py-2">
        {actions}
      </footer>
    ) : null}
  </article>
);
