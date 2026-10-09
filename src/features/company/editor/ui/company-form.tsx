import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { type Company, companyQueries } from "@entities/company";

import { toApiError } from "@shared/api";
import { applyFieldErrors } from "@shared/lib/apply-field-errors";
import { cn } from "@shared/lib/cn";
import { useDebouncedValue } from "@shared/lib/use-debounced-value";
import { Button } from "@shared/ui/button";
import { FormField } from "@shared/ui/form-field";
import { Input } from "@shared/ui/input";
import { Label } from "@shared/ui/label";
import { Spinner } from "@shared/ui/spinner";
import { Textarea } from "@shared/ui/textarea";

import {
  companyFormSchema,
  type CompanyFormValues,
  DESCRIPTION_LIMIT,
  EMPTY_COMPANY,
  NAME_LIMIT,
  RESERVED_SLUGS,
  SLUG_MIN,
  slugify,
  SOCIAL_LIMIT,
} from "../model/company-form.schema";
import { useSaveCompany } from "../model/use-save-company";

const KNOWN_FIELDS = [
  "name",
  "slug",
  "description",
  "logoUrl",
  "website",
  "location",
] as const;

const toValues = (company: Company): CompanyFormValues => ({
  name: company.name,
  slug: company.slug,
  description: company.description ?? "",
  logoUrl: company.logoUrl ?? "",
  website: company.website ?? "",
  location: company.location ?? "",
  socialLinks: company.socialLinks.map((url) => ({ url })),
});

interface CompanyFormProps {
  company?: Company;
  submitLabel: string;
  onSaved?: () => void;
  onCancel?: () => void;
  stickyActions?: boolean;
}

export const CompanyForm = ({
  company,
  submitLabel,
  onSaved,
  onCancel,
  stickyActions,
}: CompanyFormProps) => {
  const [failure, setFailure] = useState<string | null>(null);

  const save = useSaveCompany(company);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    mode: "onBlur",
    defaultValues: company ? toValues(company) : EMPTY_COMPANY,
  });

  const socialLinks = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const name = useWatch({ control: form.control, name: "name" });
  const slug = useWatch({ control: form.control, name: "slug" });
  const description = useWatch({ control: form.control, name: "description" });
  const slugTouched = form.formState.dirtyFields.slug ?? false;

  useEffect(() => {
    if (!slugTouched) form.setValue("slug", slugify(name));
  }, [name, slugTouched, form]);

  const debouncedSlug = useDebouncedValue(slug, 300);

  const availability = useQuery({
    ...companyQueries.availability(debouncedSlug),
    enabled:
      debouncedSlug.length >= SLUG_MIN && debouncedSlug !== company?.slug,
  });

  const slugReserved = RESERVED_SLUGS.has(slug);
  const slugTaken = !slugReserved && availability.data?.available === false;

  const slugError = () => {
    if (form.formState.errors.slug?.message)
      return form.formState.errors.slug.message;
    if (slugReserved) return "That address is reserved";
    if (slugTaken) return "That address is taken";
    return undefined;
  };

  const submit = form.handleSubmit((values) => {
    setFailure(null);

    save.mutate(values, {
      onSuccess: () => {
        toast.success(company ? "Company updated" : "Company created");
        onSaved?.();
      },
      onError: (error) => {
        setFailure(
          applyFieldErrors(toApiError(error), form.setError, KNOWN_FIELDS),
        );
      },
    });
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => void submit(e)}>
      <FormField
        id="name"
        label="Name"
        error={form.formState.errors.name?.message}
        hint={
          <span
            className={cn(
              "font-mono tabular-nums",
              name.length > NAME_LIMIT && "text-destructive",
            )}
          >
            {name.length} / {NAME_LIMIT}
          </span>
        }
      >
        <Input
          id="name"
          autoComplete="organization"
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
      </FormField>

      <FormField
        id="slug"
        label="Address"
        error={slugError()}
        hint={
          <span className="font-mono break-all">
            /c/{slug || "your-company"}
          </span>
        }
      >
        <Input
          id="slug"
          autoComplete="off"
          aria-invalid={
            Boolean(form.formState.errors.slug) || slugTaken || slugReserved
          }
          {...form.register("slug")}
        />
      </FormField>

      <FormField
        id="description"
        label="About"
        error={form.formState.errors.description?.message}
        hint={
          <span
            className={cn(
              "font-mono tabular-nums",
              description.length > DESCRIPTION_LIMIT && "text-destructive",
            )}
          >
            {description.length} / {DESCRIPTION_LIMIT}
          </span>
        }
      >
        <Textarea
          id="description"
          rows={6}
          placeholder="What the company does, how it works, who it is looking for."
          aria-invalid={Boolean(form.formState.errors.description)}
          {...form.register("description")}
        />
      </FormField>

      <FormField
        id="location"
        label="Location"
        error={form.formState.errors.location?.message}
      >
        <Input
          id="location"
          autoComplete="off"
          placeholder="Berlin"
          {...form.register("location")}
        />
      </FormField>

      <FormField
        id="website"
        label="Website"
        error={form.formState.errors.website?.message}
      >
        <Input
          id="website"
          inputMode="url"
          placeholder="https://"
          autoComplete="off"
          aria-invalid={Boolean(form.formState.errors.website)}
          {...form.register("website")}
        />
      </FormField>

      <FormField
        id="logoUrl"
        label="Logo"
        error={form.formState.errors.logoUrl?.message}
        hint="A link to an image."
      >
        <Input
          id="logoUrl"
          inputMode="url"
          placeholder="https://"
          autoComplete="off"
          aria-invalid={Boolean(form.formState.errors.logoUrl)}
          {...form.register("logoUrl")}
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <Label htmlFor="social-0">Social links</Label>

        {socialLinks.fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Input
                id={`social-${index}`}
                inputMode="url"
                placeholder="https://"
                autoComplete="off"
                aria-invalid={Boolean(
                  form.formState.errors.socialLinks?.[index]?.url,
                )}
                {...form.register(`socialLinks.${index}.url`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove link ${index + 1}`}
                onClick={() => socialLinks.remove(index)}
              >
                <XIcon />
              </Button>
            </div>

            {form.formState.errors.socialLinks?.[index]?.url ? (
              <p role="alert" className="text-destructive text-xs">
                {form.formState.errors.socialLinks[index].url.message}
              </p>
            ) : null}
          </div>
        ))}

        {socialLinks.fields.length < SOCIAL_LIMIT ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start font-mono text-xs"
            onClick={() => socialLinks.append({ url: "" })}
          >
            <PlusIcon className="size-3.5" />
            Add link
          </Button>
        ) : null}

        <p className="text-muted-foreground font-mono text-xs tabular-nums">
          {socialLinks.fields.length} / {SOCIAL_LIMIT}
        </p>
      </div>

      {failure ? (
        <p role="alert" className="text-destructive text-sm">
          {failure}
        </p>
      ) : null}

      <div
        className={cn(
          "flex flex-wrap justify-end gap-2",
          stickyActions &&
            "bg-popover from-muted/50 to-muted/50 sticky -bottom-4 z-10 -mx-4 -mb-4 rounded-b-xl border-t bg-linear-to-b p-4",
        )}
      >
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={save.isPending || slugTaken || slugReserved}
        >
          {save.isPending ? <Spinner /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
