import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { CreatePostButton } from "@features/post/editor";

import type { CompanyPage, CompanyViewer } from "@entities/company";
import { PostList } from "@entities/post";
import { sessionQueries } from "@entities/session";

import { Label } from "@shared/ui/label";
import { Switch } from "@shared/ui/switch";

import { companyRoute } from "../model/company-route";
import { postActions, postInteraction } from "./post-actions";

interface CompanyPostsProps {
  company: CompanyPage;
  viewer: CompanyViewer | null;
}

export const CompanyPosts = ({ company, viewer }: CompanyPostsProps) => {
  const { openRoles } = companyRoute.useSearch();
  const navigate = useNavigate();
  const { data: user } = useQuery(sessionQueries.current());

  const canPost = viewer?.role === "owner" || viewer?.role === "hr";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="open-roles"
            checked={openRoles ?? false}
            onCheckedChange={(checked) =>
              void navigate({
                to: "/c/$slug",
                params: { slug: company.slug },
                search: { tab: "posts", openRoles: checked || undefined },
                replace: true,
              })
            }
          />
          <Label htmlFor="open-roles" className="text-sm">
            Open roles only
          </Label>
        </div>

        {canPost ? <CreatePostButton companyId={company.id} /> : null}
      </div>

      <PostList
        filters={{
          companyId: company.id,
          ...(openRoles ? { type: "vacancy" as const } : {}),
        }}
        emptyMessage={
          openRoles ? "No open roles right now." : "Nothing published yet."
        }
        endMessage="That is everything from this company."
        renderActions={(post) => postActions(post, user?.id)}
        renderInteraction={postInteraction}
      />
    </div>
  );
};
