import slug from "slugify";
import { z } from "zod";

export const NAME_LIMIT = 100;
export const DESCRIPTION_LIMIT = 5000;
export const SOCIAL_LIMIT = 5;
export const SLUG_MIN = 3;
export const SLUG_MAX = 32;

export const RESERVED_SLUGS = new Set(["mine", "availability"]);

const httpUrl = z.url({ protocol: /^https?$/ }).max(500);

const optionalLink = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || httpUrl.safeParse(value).success,
    "Enter a link that starts with http:// or https://",
  );

export const companyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name")
    .max(NAME_LIMIT, `Name must be ${NAME_LIMIT} characters or fewer`),
  slug: z
    .string()
    .trim()
    .min(SLUG_MIN, `Address must be at least ${SLUG_MIN} characters`)
    .max(SLUG_MAX, `Address must be ${SLUG_MAX} characters or fewer`)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits and hyphens only")
    .refine((slug) => !RESERVED_SLUGS.has(slug), "That address is reserved"),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_LIMIT, "Description is too long"),
  logoUrl: optionalLink,
  website: optionalLink,
  location: z.string().trim().max(120, "Location is too long"),
  socialLinks: z
    .array(z.object({ url: optionalLink }))
    .max(SOCIAL_LIMIT, "Up to five links"),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const EMPTY_COMPANY: CompanyFormValues = {
  name: "",
  slug: "",
  description: "",
  logoUrl: "",
  website: "",
  location: "",
  socialLinks: [],
};

export const toCompanyBody = (values: CompanyFormValues) => ({
  slug: values.slug,
  name: values.name,
  ...(values.description ? { description: values.description } : {}),
  ...(values.logoUrl ? { logoUrl: values.logoUrl } : {}),
  ...(values.website ? { website: values.website } : {}),
  ...(values.location ? { location: values.location } : {}),
  socialLinks: values.socialLinks
    .map((link) => link.url.trim())
    .filter(Boolean),
});

export const slugify = (name: string) =>
  slug(name.replace(/[^\p{L}\p{N}]+/gu, " "), {
    lower: true,
    strict: true,
  }).slice(0, SLUG_MAX);
