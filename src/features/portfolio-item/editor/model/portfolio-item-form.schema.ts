import { z } from "zod";

import type { CreatePortfolioItemDto } from "@shared/api";

export const TITLE_LIMIT = 100;
export const DESCRIPTION_LIMIT = 2000;
export const LINK_LIMIT = 3;

const httpUrl = z
  .url({ protocol: /^https?$/ })
  .max(500, "A link must be 500 characters or fewer");

const optionalLink = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || httpUrl.safeParse(value).success,
    "Enter a link that starts with http:// or https://",
  );

export const portfolioItemFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title")
    .max(TITLE_LIMIT, `Title must be ${TITLE_LIMIT} characters or fewer`),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_LIMIT,
      `Description must be ${DESCRIPTION_LIMIT} characters or fewer`,
    ),
  previewUrl: optionalLink,
  links: z
    .array(z.object({ url: optionalLink }))
    .max(LINK_LIMIT, `Up to ${LINK_LIMIT} links`),
});

export type PortfolioItemFormValues = z.infer<typeof portfolioItemFormSchema>;

export const toPortfolioItemBody = (
  values: PortfolioItemFormValues,
): CreatePortfolioItemDto => ({
  title: values.title,
  ...(values.description ? { description: values.description } : {}),
  links: values.links.map((link) => link.url).filter(Boolean),
  ...(values.previewUrl ? { previewUrl: values.previewUrl } : {}),
});
