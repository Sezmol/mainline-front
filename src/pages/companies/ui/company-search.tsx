import { useEffect, useState } from "react";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { useDebouncedValue } from "@shared/lib/use-debounced-value";
import { Input } from "@shared/ui/input";

import { companiesRoute } from "../model/companies-route";

export const CompanySearch = ({ value }: { value?: string }) => {
  const navigate = companiesRoute.useNavigate();
  const [text, setText] = useState(value ?? "");
  const debounced = useDebouncedValue(text, 300);

  useEffect(() => {
    void navigate({
      search: debounced ? { q: debounced } : {},
      replace: true,
    });
  }, [debounced, navigate]);

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
      <Input
        aria-label="Search companies"
        placeholder="Search"
        autoComplete="off"
        className="w-44 pl-8"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </div>
  );
};
