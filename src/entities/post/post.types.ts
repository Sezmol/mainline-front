import type { PostDtoOutput, PostPageDtoOutput } from "@shared/api";
import type { PostType, Speciality } from "@shared/config";

export type Post = PostDtoOutput;

export type PostPage = PostPageDtoOutput;

export interface FeedFilters {
  type?: PostType;
  direction?: Speciality;
}
