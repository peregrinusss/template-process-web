import {
  CHECK_EMPTY,
  CHECK_MARK,
  OBJECT_TYPES,
  SHARED_FIELDS,
  TAG_PREFIX,
  type ObjectType,
} from "@/config/fields";
import { ADDITIONAL_GROUP_SIZE } from "@/config/templates";
import type { AuthorData, FieldValues, FormState, TemplateData } from "@/types";

const clean = (v: string | undefined) => (v ?? "").trim();

export function fullnameLong(v: FieldValues): string {
  return [v.lastname, v.firstname, v.middlename]
    .map(clean)
    .filter(Boolean)
    .join(" ");
}

// «Иванов И. И.»; без отчества - «Иванов И.»; без фамилии - пусто
export function fullnameShort(v: FieldValues): string {
  if (!clean(v.lastname)) return "";
  const initials = [v.firstname, v.middlename]
    .map(clean)
    .filter(Boolean)
    .map((s) => `${s[0].toUpperCase()}.`)
    .join(" ");
  return [clean(v.lastname), initials].filter(Boolean).join(" ");
}

// Дата рождения (input type="date" -> YYYY-MM-DD)
export function splitDate(iso: string | undefined): {
  day: string;
  month: string;
  year: string;
} {
  const m = clean(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m
    ? { year: m[1], month: m[2], day: m[3] }
    : { day: "", month: "", year: "" };
}

// Доли вознаграждения

// Поровну с округлением до целых; остаток отдаётся первым авторам (34/33/33).
export function equalShares(count: number): string[] {
  if (count <= 0) return [];
  const base = Math.floor(100 / count);
  const rest = 100 - base * count;
  return Array.from({ length: count }, (_, i) =>
    String(base + (i < rest ? 1 : 0)),
  );
}

/**
 * Доли, которые попадут в документы: один автор - всегда 100;
 * ни одна доля не заполнена - поровну; иначе - введённые значения
 * (смешанный вариант запрещает проверка формы).
 */
export function effectiveShares(authors: AuthorData[]): string[] {
  if (authors.length === 1) return ["100"];
  const entered = authors.map((a) => clean(a.values.profit));
  return entered.some(Boolean) ? entered : equalShares(authors.length);
}

// Теги автора

/**
 * Все теги одного автора с заданным «слотом»:
 * slot '1'  - key_ria_author1_*
 * slot 'X'  - key_ria_authorX_*
 * slot 'X2' - key_ria_authorX2_*
 */
export function authorTags(
  author: AuthorData,
  n: number,
  slot: string,
  profit: string,
): Record<string, string> {
  const v = author.values;
  const dob = splitDate(v.dob);
  const fields: Record<string, string> = {
    lastname: clean(v.lastname),
    firstname: clean(v.firstname),
    middlename: clean(v.middlename),
    citizenship: clean(v.citizenship),
    address: clean(v.address),
    id_document: clean(v.id_document),
    snils: clean(v.snils),
    post: clean(v.post),
    contribution: clean(v.contribution),
    data: clean(v.data),
    bank: clean(v.bank),
    profit,
    fullname_long: fullnameLong(v),
    fullname_short: fullnameShort(v),
    dob_day: dob.day,
    dob_month: dob.month,
    dob_year: dob.year,
    n: String(n),
  };
  const prefix = `${TAG_PREFIX}author${slot}_`;
  return Object.fromEntries(
    Object.entries(fields).map(([k, val]) => [prefix + k, val]),
  );
}

// Общий контекст

// Количество листов дополнения к заявлению
export function additionalSheetsCount(authorCount: number): number {
  return Math.max(0, Math.ceil((authorCount - 1) / ADDITIONAL_GROUP_SIZE));
}

/**
 * Базовые данные для любого шаблона:
 * общие поля + вычисляемые теги + цикл key_ria_authors + первый автор (key_ria_author1_*).
 */
export function buildBaseContext(form: FormState): TemplateData {
  const { shared, authors } = form;
  const count = authors.length;
  const shares = effectiveShares(authors);

  const ctx: TemplateData = {};

  // Общие поля «как есть» (кроме селекта type - он раскрывается ниже)
  for (const f of SHARED_FIELDS) {
    if (f.key === "type") continue;
    ctx[TAG_PREFIX + f.key] = clean(shared[f.key]);
  }

  // Тип объекта
  const type = (shared.type in OBJECT_TYPES ? shared.type : "pr") as ObjectType;
  ctx.key_ria_type_long = OBJECT_TYPES[type].long;
  ctx.key_ria_type_short = OBJECT_TYPES[type].short;
  for (const t of Object.keys(OBJECT_TYPES) as ObjectType[]) {
    ctx[`key_ria_type_x_${t}`] = t === type ? CHECK_MARK : CHECK_EMPTY;
  }

  // Авторы
  ctx.key_ria_authors_count = String(count);
  ctx.key_ria_authors_short = authors
    .map((a) => fullnameShort(a.values))
    .filter(Boolean)
    .join(", ");
  ctx.key_ria_exemplar = String(count + 2);
  ctx.key_ria_docs_x_addition = count > 1 ? CHECK_MARK : CHECK_EMPTY;
  ctx.key_ria_docs_addition_sheetscount =
    count > 1 ? String(additionalSheetsCount(count)) : "";

  ctx.key_ria_authors = authors.map((a, i) =>
    authorTags(a, i + 1, "X", shares[i]),
  );
  if (authors[0]) Object.assign(ctx, authorTags(authors[0], 1, "1", shares[0]));

  return ctx;
}
