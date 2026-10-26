import { AUTHOR_FIELDS, SHARED_FIELDS, type FieldDef } from "@/config/fields";
import type { AuthorData, FieldValues, FormState } from "@/types";

export const MAX_AUTHORS = 9;

const defaults = (fields: FieldDef[]): FieldValues =>
  Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? ""]));

export const clampAuthorCount = (n: number): number =>
  Number.isFinite(n) ? Math.min(Math.max(1, Math.trunc(n)), MAX_AUTHORS) : 1;

// «1 автор», «3 автора», «5 авторов» (до MAX_AUTHORS)
export const formatAuthorCount = (n: number): string =>
  `${n} ${n === 1 ? "автор" : n < 5 ? "автора" : "авторов"}`;

let seq = 0;
export function newAuthorId(): string {
  seq += 1;
  return `a${Date.now().toString(36)}${seq}`;
}

export function createDefaultShared(): FieldValues {
  return defaults(SHARED_FIELDS);
}

export function createAuthor(values: FieldValues = {}): AuthorData {
  return {
    id: newAuthorId(),
    values: { ...defaults(AUTHOR_FIELDS), ...values },
  };
}

export function createForm(authorCount = 1): FormState {
  return {
    shared: createDefaultShared(),
    authors: Array.from({ length: clampAuthorCount(authorCount) }, () =>
      createAuthor(),
    ),
  };
}
