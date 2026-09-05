import { useState } from "react";

import { CalendarIcon, XIcon } from "@phosphor-icons/react";

import { cn } from "@shared/lib/cn";
import { dayjs } from "@shared/lib/dayjs";
import { Button } from "@shared/ui/button";
import { Calendar } from "@shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";

const toDate = (value: string) => {
  const date = dayjs(value, "YYYY-MM-DD", true);
  return date.isValid() ? date.toDate() : undefined;
};

const toValue = (date: Date) => dayjs(date).format("YYYY-MM-DD");

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}

export const DatePicker = ({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  invalid,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-invalid={invalid}
            className={cn(
              "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 bg-field flex h-8 w-full items-center gap-2 rounded-lg border px-2.5 py-1 text-left text-base transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 md:text-sm",
              !selected && "text-muted-foreground",
            )}
          />
        }
      >
        <CalendarIcon className="text-muted-foreground size-3.5 shrink-0" />
        <span className="truncate">
          {selected ? dayjs(selected).format("DD MMM YYYY") : placeholder}
        </span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          autoFocus
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onChange(date ? toValue(date) : "");
            setOpen(false);
          }}
        />

        {selected ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground m-1 mt-0 justify-start font-mono text-xs"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            <XIcon className="size-3.5" />
            Clear
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
