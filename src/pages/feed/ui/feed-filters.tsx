import { XIcon } from "lucide-react";

import {
  POST_TYPES,
  type PostType,
  SPECIALITIES,
  type Speciality,
  SPECIALITY_LABELS,
} from "@shared/config";
import { Button } from "@shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import { feedRoute } from "../model/feed-route";
import type { FeedSearch } from "../model/feed-search";

const TYPE_LABELS: Record<PostType, string> = {
  content: "Content",
  vacancy: "Vacancy",
  event: "Event",
};
export const FeedFilters = () => {
  const search = feedRoute.useSearch();
  const navigate = feedRoute.useNavigate();

  const setFilter = (patch: Partial<FeedSearch>) =>
    void navigate({ search: (previous) => ({ ...previous, ...patch }) });

  const active = Boolean(search.type ?? search.direction);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={search.direction ?? null}
        onValueChange={(value: string | null) =>
          setFilter({ direction: (value as Speciality | null) ?? undefined })
        }
      >
        <SelectTrigger
          aria-label="Filter by direction"
          className="h-9 w-[9.5rem] font-mono text-xs"
        >
          <SelectValue>
            {(value: string | null) =>
              value ? SPECIALITY_LABELS[value as Speciality] : "All directions"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All directions</SelectItem>
          {SPECIALITIES.map((speciality) => (
            <SelectItem key={speciality} value={speciality}>
              {SPECIALITY_LABELS[speciality]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={search.type ?? null}
        onValueChange={(value: string | null) =>
          setFilter({ type: (value as PostType | null) ?? undefined })
        }
      >
        <SelectTrigger
          aria-label="Filter by type"
          className="h-9 w-[7.5rem] font-mono text-xs"
        >
          <SelectValue>
            {(value: string | null) =>
              value ? TYPE_LABELS[value as PostType] : "All types"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All types</SelectItem>
          {POST_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {active ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground font-mono text-xs"
          onClick={() => void navigate({ search: {} })}
        >
          <XIcon className="size-3.5" />
          Reset
        </Button>
      ) : null}
    </div>
  );
};
