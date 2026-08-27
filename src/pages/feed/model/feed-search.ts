import { z } from "zod";

import { POST_TYPES, SPECIALITIES } from "@shared/config";

export const feedSearchSchema = z.object({
  type: z.enum(POST_TYPES).optional().catch(undefined),
  direction: z.enum(SPECIALITIES).optional().catch(undefined),
});

export type FeedSearch = z.infer<typeof feedSearchSchema>;
