import { GlobeIcon, LinkIcon } from "@phosphor-icons/react";

import type { CompanyPage } from "@entities/company";

import { Markdown } from "@shared/ui/markdown";

const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

export const CompanyOverview = ({ company }: { company: CompanyPage }) => {
  const hasLinks = Boolean(company.website) || company.socialLinks.length > 0;

  if (!company.description && !hasLinks) {
    return (
      <p className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
        This company has not written anything about itself yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {company.description ? <Markdown>{company.description}</Markdown> : null}

      {hasLinks ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {company.website ? (
            <li>
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 font-mono text-xs break-all transition-colors"
              >
                <GlobeIcon className="size-3.5 shrink-0" />
                {hostOf(company.website)}
              </a>
            </li>
          ) : null}

          {company.socialLinks.map((link) => (
            <li key={link}>
              <a
                href={link}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 font-mono text-xs break-all transition-colors"
              >
                <LinkIcon className="size-3.5 shrink-0" />
                {hostOf(link)}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
