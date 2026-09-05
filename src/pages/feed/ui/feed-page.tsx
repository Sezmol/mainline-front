import { useQuery } from "@tanstack/react-query";

import { CreatePostButton } from "@features/post/editor";

import { PostList } from "@entities/post";
import { sessionQueries } from "@entities/session";

import { feedRoute } from "../model/feed-route";
import { FeedFilters } from "./feed-filters";
import { postActions, postInteraction } from "./post-actions";

export const FeedPage = () => {
  const search = feedRoute.useSearch();
  const { data: user } = useQuery(sessionQueries.current());

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
              Feed
            </h1>
            <p className="text-body text-sm">
              Everything the community is publishing, newest first.
            </p>
          </div>

          <CreatePostButton />
        </div>

        <FeedFilters />
      </header>

      <PostList
        filters={search}
        renderActions={(post) => postActions(post, user?.id)}
        renderInteraction={postInteraction}
      />
    </div>
  );
};
