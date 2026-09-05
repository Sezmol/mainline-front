import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { type Post, postQueries } from "@entities/post";

import { SPECIALITY_LABELS } from "@shared/config";
import { useIntersection } from "@shared/lib/use-intersection";
import { Avatar, AvatarFallback } from "@shared/ui/avatar";
import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { ErrorState } from "@shared/ui/error-state";
import { Spinner } from "@shared/ui/spinner";

interface LikesDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LikesDialog = ({ post, open, onOpenChange }: LikesDialogProps) => {
  const likes = useInfiniteQuery({
    ...postQueries.likes(post.id),
    enabled: open,
  });

  const sentinelRef = useIntersection<HTMLButtonElement>(
    () => void likes.fetchNextPage(),
    likes.hasNextPage && !likes.isFetchingNextPage,
  );

  const people = likes.data?.pages.flatMap((page) => page.items) ?? [];

  const renderPeople = () => {
    if (likes.isPending) {
      return (
        <p className="text-muted-foreground py-6 text-center font-mono text-xs">
          Loading…
        </p>
      );
    }

    if (likes.isError) {
      return (
        <ErrorState variant="inline" message="The list could not be loaded." />
      );
    }

    return (
      <ul className="divide-border max-h-80 divide-y overflow-y-auto">
        {people.map((person) => (
          <li key={person.id}>
            <Link
              to="/u/$nickname"
              params={{ nickname: person.nickname }}
              onClick={() => onOpenChange(false)}
              className="group/person flex items-center gap-3 py-2.5"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="font-mono text-[10px]">
                  {person.firstName[0]}
                  {person.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <span className="min-w-0">
                <span className="group-hover/person:text-primary-ink block truncate text-sm font-medium transition-colors">
                  {person.firstName} {person.lastName}
                </span>
                <span className="text-muted-foreground block truncate font-mono text-xs">
                  @{person.nickname} · {SPECIALITY_LABELS[person.speciality]}
                </span>
              </span>
            </Link>
          </li>
        ))}

        {likes.hasNextPage ? (
          <li>
            <Button
              ref={sentinelRef}
              variant="ghost"
              size="sm"
              className="w-full font-mono text-xs"
              disabled={likes.isFetchingNextPage}
              onClick={() => void likes.fetchNextPage()}
            >
              {likes.isFetchingNextPage ? <Spinner /> : null}
              Load more
            </Button>
          </li>
        ) : null}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liked by</DialogTitle>
          <DialogDescription>
            {post.likeCount} {post.likeCount === 1 ? "person" : "people"} liked
            “{post.title}”.
          </DialogDescription>
        </DialogHeader>

        {renderPeople()}
      </DialogContent>
    </Dialog>
  );
};
