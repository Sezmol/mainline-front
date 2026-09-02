import type {
  InteractionDtoOutput,
  PostDtoOutput,
  PostPageDtoOutput,
} from "@shared/api";
import type { PostType, Speciality } from "@shared/config";

export type Post = PostDtoOutput;

export type PostPage = PostPageDtoOutput;

export type PostInteraction = InteractionDtoOutput;

export interface FeedFilters {
  type?: PostType;
  direction?: Speciality;
  companyId?: string;
  projectId?: string;
  scope?: "none" | "mine";
}
