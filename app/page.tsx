"use client";

/**
 * Форма генерации пакета документов.
 *
 * Одна страница: объект регистрации, авторы, подразделение, подписанты РУДН.
 * Поля строятся из config/fields.ts, генерация - через ядро (lib/plan - lib/docx - lib/package).
 */

import { useMemo, useState } from "react";
import { FormField } from "@/components/form/FormField";
import { FieldGrid, FormSection } from "@/components/form/FormSection";
import {
  Building2,
  ChevronDown,
  Download,
  FileCode2,
  FileText,
  Loader2,
  PenLine,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "@/components/Icons";
import {
  AUTHOR_FIELDS,
  FIELD_GROUPS,
  SHARED_FIELDS,
  type FieldGroup,
} from "@/config/fields";
import { fullnameShort } from "@/lib/context";
import { createDemoForm } from "@/lib/demo-data";
import { createForm } from "@/lib/form";
import {
  downloadBlob,
  generatePackage,
  type GenerateProgress,
} from "@/lib/package";
import { planDocuments } from "@/lib/plan";
import type { FormState } from "@/types";

const IS_DEV = process.env.NODE_ENV === "development";

const SHARED_SECTIONS: {
  group: Exclude<FieldGroup, "author">;
  icon: LucideIcon;
}[] = [
  { group: "object", icon: FileCode2 },
  { group: "department", icon: Building2 },
  { group: "rudn", icon: PenLine },
];

const AUTHOR_FORM_FIELDS = AUTHOR_FIELDS.filter((f) => f.key !== "profit");

const docsWord = (n: number) => {
  const d = n % 10,
    h = n % 100;
  if (d === 1 && h !== 11) return "документ";
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return "документа";
  return "документов";
};

export default function FormPage() {
  const [form, setForm] = useState<FormState>(() => createForm(1));
  const [progress, setProgress] = useState<GenerateProgress | null>(null);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState("");

  const files = useMemo(
    () => planDocuments(form).map((j) => j.fileName),
    [form],
  );

  const setShared = (key: string, value: string) =>
    setForm((f) => ({ ...f, shared: { ...f.shared, [key]: value } }));

  const setAuthor = (id: string, key: string, value: string) =>
    setForm((f) => ({
      ...f,
      authors: f.authors.map((a) =>
        a.id === id ? { ...a, values: { ...a.values, [key]: value } } : a,
      ),
    }));

  const handleGenerate = async () => {
    setError("");
    setDownloaded("");
    try {
      const pkg = await generatePackage(form, setProgress);
      downloadBlob(pkg.blob, pkg.fileName);
      setDownloaded(pkg.fileName);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setProgress(null);
    }
  };

  const sharedSection = (
    group: Exclude<FieldGroup, "author">,
    icon: LucideIcon,
  ) => (
    <FormSection
      key={group}
      id={`section-${group}`}
      icon={icon}
      title={FIELD_GROUPS[group].title}
      hint={FIELD_GROUPS[group].hint}
    >
      <FieldGrid>
        {SHARED_FIELDS.filter((f) => f.group === group).map((f) => (
          <FormField
            key={f.key}
            id={`shared.${f.key}`}
            field={f}
            value={form.shared[f.key] ?? ""}
            onChange={(v) => setShared(f.key, v)}
          />
        ))}
      </FieldGrid>
    </FormSection>
  );

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-36 space-y-5">
        <header className="px-2 pb-5">
          <h1 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
            Генерация пакета документов
          </h1>
          <p className="text-ink-400 mt-3 max-w-2xl leading-relaxed">
            Заполните сведения о программе и авторах - заявление, договор,
            согласия и остальные документы сформируются автоматически.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5">
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-500">
              <ShieldCheck
                className="w-4 h-4 text-primary"
                strokeWidth={1.75}
              />
              Данные не покидают браузер
            </span>
            {IS_DEV && (
              <button
                onClick={() => setForm(createDemoForm(1))}
                className="btn-link"
              >
                <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                Заполнить демо-данными
              </button>
            )}
          </div>
        </header>

        {sharedSection(SHARED_SECTIONS[0].group, SHARED_SECTIONS[0].icon)}

        <FormSection
          id="section-authors"
          icon={Users}
          title="Авторы"
          hint={FIELD_GROUPS.author.hint}
        >
          <div className="space-y-4">
            {form.authors.map((a, i) => (
              <div
                key={a.id}
                className="rounded-2xl bg-page/60 border border-line/70 p-5 sm:p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="grid place-items-center w-8 h-8 rounded-full bg-white border border-line text-ink-400">
                    <UserRound className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <p className="font-medium text-ink">
                    Автор {i + 1}
                    {fullnameShort(a.values) && (
                      <span className="text-ink-400 font-normal">
                        {" "}
                        · {fullnameShort(a.values)}
                      </span>
                    )}
                  </p>
                </div>
                <FieldGrid>
                  {AUTHOR_FORM_FIELDS.map((f) => (
                    <FormField
                      key={f.key}
                      id={`author.${a.id}.${f.key}`}
                      field={f}
                      value={a.values[f.key] ?? ""}
                      onChange={(v) => setAuthor(a.id, f.key, v)}
                    />
                  ))}
                </FieldGrid>
              </div>
            ))}

            {/* TODO: несколько авторов */}
            {/* <button
              type="button"
              disabled
              title="Будет доступно в следующей версии"
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-dashed border-ink-200 text-sm text-ink-300"
            >
              <UserPlus className="w-4 h-4" strokeWidth={1.75} />
              Добавить автора
            </button> */}
          </div>
        </FormSection>

        {SHARED_SECTIONS.slice(1).map((s) => sharedSection(s.group, s.icon))}
      </main>

      <div className="fixed inset-x-0 bottom-0 px-4 sm:px-6 pb-4 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto rounded-2xl bg-white/95 backdrop-blur border border-line/70 shadow-bar px-4 sm:px-5 py-3 flex items-center gap-4">
          <details className="group relative flex-1 min-w-0">
            <summary className="list-none cursor-pointer select-none inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink whitespace-nowrap">
              <FileText className="w-4 h-4 text-primary" strokeWidth={1.75} />
              {files.length} {docsWord(files.length)}
              <span className="hidden sm:inline -ml-1">в архиве</span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <ol className="absolute bottom-full mb-4 -left-1 w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-line/70 bg-white p-2 shadow-bar text-sm text-ink-500">
              {files.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-page"
                  title={f}
                >
                  <FileText
                    className="w-3.5 h-3.5 shrink-0 text-ink-300"
                    strokeWidth={1.75}
                  />
                  <span className="truncate">{f.replace(/\.docx$/, "")}</span>
                </li>
              ))}
            </ol>
          </details>

          <div className="text-right text-xs max-w-[40%] hidden sm:block">
            {error && <p className="text-accent">{error}</p>}
            {!error && downloaded && (
              <p className="text-ink-400 truncate">Скачано: {downloaded}</p>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={Boolean(progress)}
            className="btn-primary shrink-0"
          >
            {progress ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress.done} из {progress.total}
              </>
            ) : (
              <>
                Сгенерировать
                <Download className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="sm:hidden max-w-4xl mx-auto mt-2 px-2 text-xs text-accent pointer-events-auto">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
