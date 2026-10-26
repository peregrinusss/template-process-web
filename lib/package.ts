import JSZip from "jszip";
import { TEMPLATES_BASE_PATH, type TemplateDef } from "@/config/templates";
import type { FormState } from "@/types";
import { renderDocx } from "./docx";
import { planDocuments, safeFileName } from "./plan";

const templateCache = new Map<string, Promise<ArrayBuffer>>();

// Загрузить шаблон из public/templates (с кэшем на сессию)
export function loadTemplate(t: TemplateDef): Promise<ArrayBuffer> {
  let p = templateCache.get(t.file);
  if (!p) {
    p = fetch(`${TEMPLATES_BASE_PATH}/${t.file}`).then((r) => {
      if (!r.ok)
        throw new Error(`Не удалось загрузить шаблон ${t.file} (${r.status})`);
      return r.arrayBuffer();
    });
    p.catch(() => templateCache.delete(t.file));
    templateCache.set(t.file, p);
  }
  return p;
}

export interface GenerateProgress {
  done: number;
  total: number;
  current: string;
}

export interface GeneratedPackage {
  blob: Blob;
  fileName: string;
  files: string[];
}

// Сгенерировать весь пакет документов и упаковать в ZIP
export async function generatePackage(
  form: FormState,
  onProgress?: (p: GenerateProgress) => void,
): Promise<GeneratedPackage> {
  const jobs = planDocuments(form);
  const zip = new JSZip();

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    onProgress?.({ done: i, total: jobs.length, current: job.fileName });
    const template = await loadTemplate(job.template);
    try {
      zip.file(job.fileName, renderDocx(template, job.data));
    } catch (e) {
      throw new Error(
        `Ошибка в шаблоне «${job.template.title}»: ${describeError(e)}`,
      );
    }
  }
  onProgress?.({ done: jobs.length, total: jobs.length, current: "" });

  const title = form.shared.title?.trim();
  return {
    blob: await zip.generateAsync({ type: "blob", compression: "DEFLATE" }),
    fileName:
      safeFileName(
        title ? `Пакет документов - ${title.slice(0, 60)}` : "Пакет документов",
      ) + ".zip",
    files: jobs.map((j) => j.fileName),
  };
}

// Скачать Blob как файл
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Понятный текст ошибки docxtemplater (MultiError содержит список проблем по тегам)
function describeError(e: unknown): string {
  const errors = (
    e as {
      properties?: {
        errors?: Array<{ properties?: { explanation?: string } }>;
      };
    }
  )?.properties?.errors;
  if (errors?.length) {
    return errors
      .map((x) => x.properties?.explanation)
      .filter(Boolean)
      .join("; ");
  }
  return e instanceof Error ? e.message : String(e);
}
