/**
 * Проверка пакета на демо-данных: npm run check:templates
 *
 * Прогоняет planDocuments + renderDocx на демо-данных (текущая версия - один автор) и проверяет, что
 *  - docxtemplater не падает;
 *  - в тексте документов не осталось тегов {key_ria_…};
 *  - число файлов совпадает с ожидаемым (для 1 автора - ровно 10).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import PizZip from "pizzip";
import { ADDITIONAL_GROUP_SIZE, TEMPLATES } from "@/config/templates";
import { createDemoForm } from "@/lib/demo-data";
import { renderDocx } from "@/lib/docx";
import { planDocuments } from "@/lib/plan";

const TEMPLATES_DIR = join(process.cwd(), "public", "templates");
// Интерфейс и демо-данные пока рассчитаны на одного автора
const AUTHOR_COUNTS = [1];

function expectedCount(authors: number): number {
  return TEMPLATES.reduce((sum, t) => {
    if (t.strategy === "single") return sum + 1;
    if (t.strategy === "per-author") return sum + authors;
    return sum + Math.ceil((authors - 1) / ADDITIONAL_GROUP_SIZE);
  }, 0);
}

// Текст всех частей документа (тело, колонтитулы, сноски) без XML-разметки
function documentText(docx: Uint8Array): string {
  const zip = new PizZip(docx);
  return zip
    .file(/^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/)
    .map((f) => f.asText().replace(/<[^>]+>/g, ""))
    .join("\n");
}

const cache = new Map<string, Buffer>();
const load = (file: string) => {
  if (!cache.has(file))
    cache.set(file, readFileSync(join(TEMPLATES_DIR, file)));
  return cache.get(file)!;
};

let failed = 0;
const fail = (msg: string) => {
  failed += 1;
  console.error(`  ✗ ${msg}`);
};

for (const n of AUTHOR_COUNTS) {
  console.log(`\nАвторов: ${n}`);
  const jobs = planDocuments(createDemoForm(n));

  const expected = expectedCount(n);
  if (jobs.length !== expected)
    fail(`файлов ${jobs.length}, ожидалось ${expected}`);
  if (n === 1 && jobs.length !== 10)
    fail(`для 1 автора должно быть 10 файлов, получено ${jobs.length}`);

  for (const job of jobs) {
    try {
      const text = documentText(renderDocx(load(job.template.file), job.data));
      const left = Array.from(
        new Set(text.match(/\{[^{}]*key_ria_[^{}]*\}/g) ?? []),
      );
      if (left.length)
        fail(`${job.fileName}: остались теги ${left.join(", ")}`);
      else console.log(`  ✓ ${job.fileName}`);
    } catch (e) {
      const errors = (
        e as {
          properties?: {
            errors?: Array<{ properties?: { explanation?: string } }>;
          };
        }
      )?.properties?.errors;
      const detail =
        errors?.map((x) => x.properties?.explanation).join("; ") || String(e);
      fail(`${job.fileName}: ${detail}`);
    }
  }
}

if (failed) {
  console.error(`\nОшибок: ${failed}`);
  process.exit(1);
}
console.log("\nВсе проверки пройдены");
