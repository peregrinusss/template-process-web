import {
  ADDITIONAL_GROUP_SIZE,
  TEMPLATES,
  type TemplateDef,
} from "@/config/templates";
import type { FormState, TemplateData } from "@/types";
import {
  authorTags,
  buildBaseContext,
  effectiveShares,
  fullnameShort,
} from "./context";

export interface DocumentJob {
  template: TemplateDef;
  fileName: string;
  data: TemplateData;
}

// Убрать символы, недопустимые в именах файлов
export function safeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/, "");
}

/**
 * Составить список документов пакета. Чистая функция - без fetch и DOM,
 * поэтому её удобно проверять отдельно.
 */
export function planDocuments(
  form: FormState,
  templates: TemplateDef[] = TEMPLATES,
): DocumentJob[] {
  const base = buildBaseContext(form);
  const { authors } = form;
  const shares = effectiveShares(authors);
  const drafts: Array<{
    template: TemplateDef;
    title: string;
    data: TemplateData;
  }> = [];

  for (const t of templates) {
    switch (t.strategy) {
      case "single":
        drafts.push({ template: t, title: t.title, data: base });
        break;

      case "per-author":
        authors.forEach((a, i) => {
          const who = fullnameShort(a.values) || `Автор ${i + 1}`;
          drafts.push({
            template: t,
            title: authors.length > 1 ? `${t.title} - ${who}` : t.title,
            data: { ...base, ...authorTags(a, i + 1, "X", shares[i]) },
          });
        });
        break;

      case "additional": {
        const rest = authors.slice(1);
        const groups = Math.ceil(rest.length / ADDITIONAL_GROUP_SIZE);
        for (let g = 0; g < groups; g++) {
          const data: TemplateData = { ...base };
          rest
            .slice(g * ADDITIONAL_GROUP_SIZE, (g + 1) * ADDITIONAL_GROUP_SIZE)
            .forEach((a, k) => {
              const n = 2 + g * ADDITIONAL_GROUP_SIZE + k;
              Object.assign(data, authorTags(a, n, `X${k + 1}`, shares[n - 1]));
            });
          drafts.push({
            template: t,
            title: groups > 1 ? `${t.title} (лист ${g + 1})` : t.title,
            data,
          });
        }
        break;
      }
    }
  }

  const width =
    String(drafts.length).length < 2 ? 2 : String(drafts.length).length;
  return drafts.map((d, i) => ({
    template: d.template,
    data: d.data,
    fileName:
      safeFileName(`${String(i + 1).padStart(width, "0")} ${d.title}`) +
      ".docx",
  }));
}
