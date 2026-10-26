"use client";

import { ChevronDown } from "@/components/Icons";
import type { FieldDef } from "@/config/fields";

interface FormFieldProps {
  id: string;
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}

export function FormField({ id, field, value, onChange }: FormFieldProps) {
  const hintId = `${id}-hint`;
  const wide = field.wide || field.type === "textarea";
  const common = {
    id,
    name: id,
    value,
    "aria-describedby": hintId,
    className: `input-base ${field.mono ? "font-mono text-[13px]" : ""}`,
  };

  let control: React.ReactNode;
  if (field.type === "select") {
    control = (
      <div className="relative">
        <select
          {...common}
          className={`${common.className} appearance-none pr-9`}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
      </div>
    );
  } else if (field.type === "textarea") {
    control = (
      <textarea
        {...common}
        rows={field.mono ? 8 : 3}
        placeholder={field.placeholder}
        spellCheck={!field.mono}
        className={`${common.className} autosize leading-relaxed ${field.mono ? "max-h-[32rem]" : "max-h-80"}`}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else {
    const isNumber = field.type === "number";
    control = (
      <input
        {...common}
        type={isNumber ? "text" : field.type}
        inputMode={
          isNumber ? "numeric" : field.type === "email" ? "email" : undefined
        }
        placeholder={field.placeholder}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {field.label}
        {field.required && (
          <span className="text-accent ml-0.5" aria-hidden>
            *
          </span>
        )}
      </label>
      {control}
      <p id={hintId} className="mt-1.5 text-xs leading-snug text-ink-300">
        {field.hint}
      </p>
    </div>
  );
}
