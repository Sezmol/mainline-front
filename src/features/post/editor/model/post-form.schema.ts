import { z } from "zod";

import type { Post } from "@entities/post";

import type { CreatePostDto } from "@shared/api";
import {
  DEFAULT_STATUS,
  POST_TYPES,
  SPECIALITIES,
  WORK_FORMATS,
} from "@shared/config";
import { dayjs } from "@shared/lib/dayjs";

export const TITLE_LIMIT = 100;
export const BODY_LIMIT = 20_000;
export const LOCATION_LIMIT = 120;
export const STATUS_LIMIT = 40;
export const ATTACHMENT_LIMIT = 5;
const SALARY_LIMIT = 100_000_000;
const PARTICIPANT_LIMIT = 100_000;

const attachmentLink = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      z
        .url({ protocol: /^https?$/ })
        .max(500)
        .safeParse(value).success,
    "Enter a link that starts with http:// or https://",
  );

const salarySchema = z
  .number()
  .int("Salary must be a whole number")
  .min(0, "Salary cannot be negative")
  .max(SALARY_LIMIT, "That salary looks too large")
  .optional();

export const postFormSchema = z
  .object({
    type: z.enum(POST_TYPES),
    direction: z.enum(SPECIALITIES, { message: "Pick a direction" }),
    title: z
      .string()
      .trim()
      .min(1, "Enter a title")
      .max(TITLE_LIMIT, `Title must be ${TITLE_LIMIT} characters or fewer`),
    body: z
      .string()
      .trim()
      .min(1, "Write something")
      .max(BODY_LIMIT, `A post must be ${BODY_LIMIT} characters or fewer`),
    location: z
      .string()
      .trim()
      .max(
        LOCATION_LIMIT,
        `Location must be ${LOCATION_LIMIT} characters or fewer`,
      ),
    salaryMin: salarySchema,
    salaryMax: salarySchema,
    workFormat: z.enum(WORK_FORMATS).optional(),
    isPrivate: z.boolean(),
    companyId: z.string(),
    participantLimit: z
      .number()
      .int("The limit must be a whole number")
      .min(2, "An event needs room for at least two")
      .max(PARTICIPANT_LIMIT, "That limit looks too large")
      .optional(),
    projectId: z.string(),
    status: z
      .string()
      .trim()
      .max(
        STATUS_LIMIT,
        `A column name is ${STATUS_LIMIT} characters or fewer`,
      ),
    deadline: z.string(),
    attachments: z
      .array(z.object({ url: attachmentLink }))
      .max(ATTACHMENT_LIMIT, `Up to ${ATTACHMENT_LIMIT} links`),
  })
  .superRefine((values, ctx) => {
    if (values.type === "task" && values.status === "") {
      ctx.addIssue({
        code: "custom",
        path: ["status"],
        message: "Choose a column",
      });
    }

    if (values.type !== "vacancy") return;

    if (!values.workFormat) {
      ctx.addIssue({
        code: "custom",
        path: ["workFormat"],
        message: "Choose a work format",
      });
    }

    const { salaryMin, salaryMax } = values;

    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      salaryMin > salaryMax
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMin"],
        message: "The lower bound cannot be above the upper one",
      });
    }
  });

export type PostFormValues = z.infer<typeof postFormSchema>;

export const toOptionalNumber = (value: string) =>
  value === "" ? undefined : Number(value);

export const emptyPostForm = (type: PostFormValues["type"]) => ({
  type,
  direction: undefined,
  title: "",
  body: "",
  location: "",
  salaryMin: undefined,
  salaryMax: undefined,
  workFormat: undefined,
  isPrivate: type === "task",
  participantLimit: undefined,
  companyId: "",
  projectId: "",
  status: type === "task" ? DEFAULT_STATUS : "",
  deadline: "",
  attachments: [],
});

export const toFormValues = (post: Post) => ({
  ...emptyPostForm(post.type),
  direction: post.direction,
  title: post.title,
  body: post.body,
  companyId: post.company?.id ?? "",
  ...(post.type === "vacancy" || post.type === "event"
    ? { location: post.location ?? "" }
    : {}),
  ...(post.type === "vacancy"
    ? {
        salaryMin: post.salaryMin ?? undefined,
        salaryMax: post.salaryMax ?? undefined,
        workFormat: post.workFormat,
      }
    : {}),
  ...(post.type === "event"
    ? {
        isPrivate: post.isPrivate,
        participantLimit: post.participantLimit ?? undefined,
      }
    : {}),
  ...(post.type === "task"
    ? {
        isPrivate: post.isPrivate,
        projectId: post.projectId ?? "",
        status: post.status,
        deadline: post.deadline ? post.deadline.slice(0, 10) : "",
        attachments: post.attachments.map((url) => ({ url })),
      }
    : {}),
});

export const toPayload = (values: PostFormValues) => {
  const common = {
    direction: values.direction,
    title: values.title,
    body: values.body,
    ...(values.companyId ? { companyId: values.companyId } : {}),
  };
  const location = values.location === "" ? null : values.location;

  switch (values.type) {
    case "vacancy":
      if (!values.workFormat) {
        throw new Error("A vacancy without a work format should not validate");
      }

      return {
        ...common,
        type: "vacancy",
        location,
        salaryMin: values.salaryMin ?? null,
        salaryMax: values.salaryMax ?? null,
        workFormat: values.workFormat,
      } satisfies CreatePostDto;

    case "event":
      return {
        ...common,
        type: "event",
        location,
        isPrivate: values.isPrivate,
        participantLimit: values.isPrivate
          ? null
          : (values.participantLimit ?? null),
      } satisfies CreatePostDto;

    case "task":
      return {
        ...common,
        type: "task",
        projectId: values.projectId === "" ? null : values.projectId,
        status: values.status,
        deadline:
          values.deadline === ""
            ? null
            : dayjs.utc(values.deadline).toISOString(),
        isPrivate: values.isPrivate,
        attachments: values.attachments.map((link) => link.url).filter(Boolean),
      } satisfies CreatePostDto;

    case "content":
      return { ...common, type: "content" } satisfies CreatePostDto;
  }
};
