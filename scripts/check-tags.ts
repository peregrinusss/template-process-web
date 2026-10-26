/**
 * Полнота тегов: каждый тег шаблонов либо вводится в форме, либо вычисляется,
 * и при генерации на демо-данных получает значение (а не пустую строку по nullGetter).
 * Запуск: npm run check:tags
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { AUTHOR_FIELDS, SHARED_FIELDS, getTagHint } from "@/config/fields";
import { TEMPLATES } from "@/config/templates";
import { createDemoForm } from "@/lib/demo-data";
import { planDocuments } from "@/lib/plan";

const DIR = join(process.cwd(), "public", "templates");
const XML_PART =
  /^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/;

function paragraphs(file: string): string[] {
  const zip = new PizZip(readFileSync(join(DIR, file)));
  const out: string[] = [];
  for (const name of Object.keys(zip.files)) {
    if (!XML_PART.test(name)) continue;
    const xml = zip.file(name)!.asText();
    for (const p of xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? []) {
      out.push(
        (p.match(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g) ?? [])
          .map((t) => t.replace(/<[^>]+>/g, ""))
          .join(""),
      );
    }
  }
  return out;
}

let problems = 0;
const used = new Set<string>();
const fail = (msg: string) => {
  problems++;
  console.log("  ✗ " + msg);
};

for (const t of TEMPLATES) {
  console.log(`\n${t.title} (${t.file})`);
  const text = paragraphs(t.file);
  const tags = new Set<string>();
  for (const line of text) {
    for (const m of line.matchAll(/\{([#/^]?)([^{}]*)\}/g))
      tags.add(m[2].trim());
    // подозрительные места: старый синтаксис, незакрытые скобки
    if (/\$\{|\$[a-zа-я_]/i.test(line))
      fail(`старый синтаксис $: «${line.slice(0, 90)}»`);
    if ((line.match(/\{/g) ?? []).length !== (line.match(/\}/g) ?? []).length)
      fail(`непарные скобки: «${line.slice(0, 90)}»`);
    if (/key_ria_/.test(line.replace(/\{[^{}]*\}/g, "")))
      fail(`тег без скобок: «${line.slice(0, 90)}»`);
  }
  for (const tag of tags) {
    used.add(tag);
    const info = getTagHint(tag);
    if (!info) fail(`тег не описан в config/fields.ts: ${tag}`);
  }
  console.log(`  тегов: ${tags.size}`);
}

// Каждый тег получает значение при генерации (1 автор - целевой режим)
console.log("\nГенерация на демо-данных (1 автор):");
for (const job of planDocuments(createDemoForm(1))) {
  const missing = new Set<string>();
  const doc = new Docxtemplater(
    new PizZip(readFileSync(join(DIR, job.template.file))),
    {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: (part) => {
        if (part.value) missing.add(String(part.value));
        return "";
      },
      // пустая строка тоже считается пропуском: значит, поле не заполнено или не вычислилось
      parser: (tag) => ({
        get: (scope: Record<string, unknown>) => {
          const v = tag === "." ? scope : scope?.[tag];
          if (v === "") missing.add(tag);
          return v;
        },
      }),
    },
  );
  doc.render(job.data);
  // При одном авторе дополнения к заявлению нет - число его листов законно пустое
  const empty = [...missing].filter(
    (t) => t !== "key_ria_docs_addition_sheetscount",
  );
  if (empty.length) fail(`${job.fileName}: нет значения у ${empty.join(", ")}`);
  else console.log(`  ✓ ${job.fileName}`);
}

// Обратная проверка: каждое поле формы используется хотя бы в одном шаблоне
console.log("\nПоля формы без использования в шаблонах:");
const flat = [...used].join(" ");
for (const f of SHARED_FIELDS) {
  const keys = f.key === "type" ? ["key_ria_type_"] : [`key_ria_${f.key}`];
  if (
    !keys.some((k) =>
      [...used].some((u) => u === k || (k.endsWith("_") && u.startsWith(k))),
    )
  )
    fail(`общее поле ${f.key}`);
}
for (const f of AUTHOR_FIELDS) {
  const suffix = f.key === "dob" ? "dob_" : `${f.key}\\b`; // дата рождения - через dob_day/month/year
  if (!new RegExp(`key_ria_author(\\d+|X\\d*)_${suffix}`).test(flat))
    fail(`поле автора ${f.key}`);
}

console.log(problems ? `\nПроблем: ${problems}` : "\nВсе теги учтены");
process.exit(problems ? 1 : 0);
