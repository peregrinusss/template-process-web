/**
 * Поля формы и подсказки для всех ключей шаблонов.
 *
 * Три слоя:
 *  1. SHARED_FIELDS - общие поля, которые вводит пользователь;
 *  2. AUTHOR_FIELDS - поля, которые вводятся для каждого автора;
 *  3. COMPUTED_TAGS - теги, которые вычисляются автоматически и в форме не показываются.
 *
 * getTagHint(tag) даёт подсказку для любого ключа из шаблонов:
 * key_ria_title, key_ria_author1_snils, key_ria_authorX_snils, key_ria_authorX2_snils и т. д.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "email"
  | "number"
  | "select";

export type FieldGroup = "object" | "department" | "rudn" | "author";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  hint: string;
  type: FieldType;
  group: FieldGroup;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: FieldOption[];
  wide?: boolean;
  mono?: boolean;
}

export const TAG_PREFIX = "key_ria_";

export const FIELD_GROUPS: Record<FieldGroup, { title: string; hint: string }> =
  {
    object: {
      title: "Объект регистрации",
      hint: "Сведения о программе для ЭВМ или базе данных",
    },
    department: {
      title: "Подразделение",
      hint: "Структурное подразделение РУДН, где создан объект",
    },
    rudn: {
      title: "Подписанты РУДН",
      hint: "Меняются редко - обычно достаточно проверить значения по умолчанию",
    },
    author: {
      title: "Авторы",
      hint: "Персональные данные автора - попадают в договор, заявление и согласия",
    },
  };

// Тип объекта: из одного селекта вычисляются type_long, type_short, type_x_*

export type ObjectType = "pr" | "bd59" | "bd34";

export const OBJECT_TYPES: Record<
  ObjectType,
  { label: string; long: string; short: string }
> = {
  pr: {
    label: "Программа для ЭВМ",
    long: "Программа для ЭВМ",
    short: "ПрЭВМ",
  },
  bd59: {
    label: "База данных (п. 4 ст. 1259 ГК РФ)",
    long: "База данных",
    short: "БД",
  },
  bd34: {
    label: "База данных (п. 3 ст. 1334 ГК РФ)",
    long: "База данных",
    short: "БД",
  },
};

// Отметка в чекбоксах заявления: «(отметить [X])».
export const CHECK_MARK = "[X]";
export const CHECK_EMPTY = "[  ]";

// 1. Общие поля

export const SHARED_FIELDS: FieldDef[] = [
  // Объект регистрации
  {
    key: "type",
    label: "Тип объекта",
    hint: "Определяет название объекта и отметку [X] в заявлении и согласиях",
    type: "select",
    group: "object",
    required: true,
    defaultValue: "pr",
    options: (Object.keys(OBJECT_TYPES) as ObjectType[]).map((value) => ({
      value,
      label: OBJECT_TYPES[value].label,
    })),
  },
  {
    key: "title",
    label: "Название",
    hint: "Полное название программы или БД - так, как оно будет в свидетельстве Роспатента",
    type: "text",
    group: "object",
    wide: true,
    required: true,
    placeholder: "Генератор пакета документов для регистрации РИД",
  },
  {
    key: "annotation",
    label: "Аннотация",
    hint: "Краткое описание назначения и функций (реферат). Попадает в реферат и Приложение 1 к договору",
    type: "textarea",
    group: "object",
    required: true,
    placeholder: "Программа предназначена для…",
  },
  {
    key: "specification",
    label: "Индивидуализирующие признаки",
    hint: "Чем объект отличается от аналогов: ключевые функции, особенности реализации",
    type: "textarea",
    group: "object",
    placeholder:
      "Автоматическое заполнение шаблонов, поддержка нескольких авторов…",
  },
  {
    key: "programming_language",
    label: "Язык программирования",
    hint: "Для реферата. Можно перечислить несколько через запятую",
    type: "text",
    group: "object",
    placeholder: "TypeScript, Python",
  },
  {
    key: "code_size",
    label: "Объём программы",
    hint: "Размер исходного кода с единицами измерения",
    type: "text",
    group: "object",
    placeholder: "120 КБ",
  },
  {
    key: "code",
    label: "Листинг",
    hint: "Текст исходного кода (или его фрагмент), который печатается после титульного листа листинга",
    type: "textarea",
    group: "object",
    mono: true,
    placeholder: "Вставьте исходный код…",
  },
  {
    key: "nir",
    label: "Тема (номер) НИР / НИОКР",
    hint: "Тема или номер НИР, в рамках которой создан объект. Если не было - поставьте «-»",
    type: "text",
    group: "object",
    defaultValue: "-",
  },
  {
    key: "year",
    label: "Год",
    hint: "Год оформления документов - стоит в датах, на обложке и титульном листе",
    type: "number",
    group: "object",
    required: true,
    defaultValue: String(new Date().getFullYear()),
  },
  {
    key: "address",
    label: "E-mail авторов для переписки",
    hint: "Электронный адрес, на который направляются сообщения по договору (п. 9.9 договора)",
    type: "email",
    group: "object",
    required: true,
    placeholder: "ivanov_ii@pfur.ru",
  },

  // Подразделение
  {
    key: "department_title",
    label: "Структурное подразделение",
    hint: "Факультет, институт, департамент или центр, где работают/учатся авторы",
    type: "text",
    group: "department",
    wide: true,
    required: true,
    placeholder: "Факультет физико-математических и естественных наук",
  },
  {
    key: "department_contacts",
    label: "Контакты подразделения",
    hint: "Телефон и/или e-mail контактного лица подразделения",
    type: "text",
    group: "department",
    placeholder: "+7 (495) 000-00-00, fmin@rudn.ru",
  },
  {
    key: "docs_submission_responsible_fullname_short",
    label: "Ответственный за подачу документов",
    hint: "Фамилия и инициалы сотрудника, который подаёт уведомление-заявку",
    type: "text",
    group: "department",
    placeholder: "Петров П. П.",
  },

  // Подписанты РУДН
  {
    key: "rector_fullname_long_rod",
    label: "Проректор - ФИО полностью в родительном падеже",
    hint: "Для преамбулы договора: «в лице первого проректора - проректора по научной работе …»",
    type: "text",
    group: "rudn",
    wide: true,
    required: true,
    placeholder: "Иванова Ивана Ивановича",
  },
  {
    key: "rector_fullname_short",
    label: "Проректор - инициалы и фамилия",
    hint: "Для подписей в договоре и заявлении",
    type: "text",
    group: "rudn",
    required: true,
    placeholder: "И. И. Иванов",
  },
  {
    key: "proxy",
    label: "Доверенность проректора",
    hint: "Номер и дата доверенности, на основании которой действует проректор",
    type: "text",
    group: "rudn",
    required: true,
    placeholder: "№ 0000 от 01.01.2026",
  },
];

// 2. Поля автора

export const AUTHOR_FIELDS: FieldDef[] = [
  {
    key: "lastname",
    label: "Фамилия",
    hint: "В именительном падеже",
    type: "text",
    group: "author",
    required: true,
    placeholder: "Иванов",
  },
  {
    key: "firstname",
    label: "Имя",
    hint: "В именительном падеже",
    type: "text",
    group: "author",
    required: true,
    placeholder: "Иван",
  },
  {
    key: "middlename",
    label: "Отчество",
    hint: "Если отчества нет - оставьте пустым",
    type: "text",
    group: "author",
    placeholder: "Иванович",
  },
  {
    key: "dob",
    label: "Дата рождения",
    hint: "В документах разбивается на число, месяц и год",
    type: "date",
    group: "author",
    required: true,
  },
  {
    key: "citizenship",
    label: "Гражданство",
    hint: "Для заявления в Роспатент и согласия автора",
    type: "text",
    group: "author",
    required: true,
    defaultValue: "Российская Федерация",
  },
  {
    key: "address",
    label: "Адрес регистрации",
    hint: "Место жительства с индексом и страной - как в паспорте",
    type: "text",
    group: "author",
    wide: true,
    required: true,
    placeholder: "Россия, 117198, г. Москва, ул. Миклухо-Маклая, д. 6, кв. 1",
  },
  {
    key: "id_document",
    label: "Документ, удостоверяющий личность",
    hint: "Вид документа, серия и номер, кем и когда выдан",
    type: "text",
    group: "author",
    wide: true,
    required: true,
    placeholder:
      "паспорт 45 00 123456, выдан ГУ МВД России по г. Москве 01.01.2020",
  },
  {
    key: "snils",
    label: "СНИЛС",
    hint: "11 цифр в формате XXX-XXX-XXX XX",
    type: "text",
    group: "author",
    required: true,
    placeholder: "123-456-789 00",
  },
  {
    key: "post",
    label: "Должность / статус",
    hint: "Для уведомления о создании РИД: должность, либо «студент», «аспирант»",
    type: "text",
    group: "author",
    required: true,
    placeholder: "доцент кафедры информационных технологий",
  },
  {
    key: "contribution",
    label: "Творческий вклад",
    hint: "Кратко, что именно сделал автор при создании программы/БД",
    type: "textarea",
    group: "author",
    required: true,
    placeholder: "Разработка архитектуры и алгоритма генерации документов",
  },
  {
    key: "data",
    label: "Реквизиты для платежа",
    hint: "Номер счёта получателя (р/с или номер карты) для выплаты вознаграждения",
    type: "text",
    group: "author",
    required: true,
    placeholder: "р/с 40817810000000000000",
  },
  {
    key: "bank",
    label: "Банк получателя",
    hint: "Наименование банка, БИК, корр. счёт",
    type: "text",
    group: "author",
    wide: true,
    required: true,
    placeholder: "ПАО Сбербанк, БИК 044525225, к/с 30101810400000000225",
  },
  {
    key: "profit",
    label: "Доля вознаграждения, %",
    hint: "Сумма долей всех авторов должна быть 100%. Если не заполнять - делится поровну",
    type: "number",
    group: "author",
    placeholder: "100",
  },
];

// 3. Вычисляемые теги (в форме не показываются)

export interface ComputedTagDef {
  label: string;
  hint: string;
  from: string;
}

// Общие вычисляемые теги (полные имена).
export const COMPUTED_SHARED_TAGS: Record<string, ComputedTagDef> = {
  key_ria_authors: {
    label: "Список авторов",
    hint: "Цикл по авторам {#key_ria_authors}…{/key_ria_authors}: внутри доступны поля key_ria_authorX_*",
    from: "authors[]",
  },
  key_ria_type_long: {
    label: "Тип объекта (полностью)",
    hint: "Полное название типа объекта: «Программа для ЭВМ» / «База данных»",
    from: "type",
  },
  key_ria_type_short: {
    label: "Тип объекта (сокращённо)",
    hint: "Сокращённое название типа объекта: «ПрЭВМ» / «БД»",
    from: "type",
  },
  key_ria_type_x_pr: {
    label: "Отметка «Программа для ЭВМ»",
    hint: "Отметка [X], если регистрируется программа для ЭВМ",
    from: "type",
  },
  key_ria_type_x_bd59: {
    label: "Отметка «БД, ст. 1259»",
    hint: "Отметка [X], если регистрируется БД по п. 4 ст. 1259 ГК РФ",
    from: "type",
  },
  key_ria_type_x_bd34: {
    label: "Отметка «БД, ст. 1334»",
    hint: "Отметка [X], если регистрируется БД по п. 3 ст. 1334 ГК РФ",
    from: "type",
  },
  key_ria_authors_short: {
    label: "Авторы (кратко)",
    hint: "Список авторов через запятую: «Иванов И. И., Петров П. П.»",
    from: "authors[].fullname_short",
  },
  key_ria_authors_count: {
    label: "Количество авторов",
    hint: "Общее количество авторов",
    from: "authors.length",
  },
  key_ria_exemplar: {
    label: "Число экземпляров договора",
    hint: "Число экземпляров договора: по одному каждому автору, РУДН и Роспатенту",
    from: "authors.length + 2",
  },
  key_ria_docs_x_addition: {
    label: "Отметка «Дополнение к заявлению»",
    hint: "Отметка [X] в перечне документов заявления, если есть дополнение (авторов больше одного)",
    from: "authors.length > 1",
  },
  key_ria_docs_addition_sheetscount: {
    label: "Листов дополнения",
    hint: "Количество листов дополнения к заявлению (по одному на каждых трёх дополнительных авторов)",
    from: "ceil((authors.length - 1) / 3)",
  },
};

// Вычисляемые поля автора (суффиксы после authorN_ / authorX_).
export const COMPUTED_AUTHOR_TAGS: Record<string, ComputedTagDef> = {
  fullname_long: {
    label: "ФИО полностью",
    hint: "Фамилия, имя и отчество полностью",
    from: "lastname + firstname + middlename",
  },
  fullname_short: {
    label: "Фамилия и инициалы",
    hint: "Фамилия и инициалы: «Иванов И. И.»",
    from: "lastname + firstname + middlename",
  },
  dob_day: {
    label: "День рождения",
    hint: "День рождения, две цифры",
    from: "dob",
  },
  dob_month: {
    label: "Месяц рождения",
    hint: "Месяц рождения, две цифры",
    from: "dob",
  },
  dob_year: {
    label: "Год рождения",
    hint: "Год рождения, четыре цифры",
    from: "dob",
  },
  n: {
    label: "Номер автора",
    hint: "Порядковый номер автора (1, 2, 3…)",
    from: "позиция в списке авторов",
  },
};

// Поиск подсказки для любого ключа из шаблонов

const sharedByKey = new Map(SHARED_FIELDS.map((f) => [f.key, f]));
const authorByKey = new Map(AUTHOR_FIELDS.map((f) => [f.key, f]));

/** key_ria_author1_snils, key_ria_authorX_snils, key_ria_authorX2_snils -> { slot, field } */
const AUTHOR_TAG_RE = /^key_ria_author(\d+|X\d*)_(.+)$/;

export interface TagInfo {
  tag: string;
  label: string;
  hint: string;
  computed: boolean;
  authorSlot?: string;
}

function slotLabel(slot: string): string {
  if (/^\d+$/.test(slot)) return `автор ${slot}`;
  if (slot === "X") return "текущий автор";
  return `автор ${slot.slice(1)} в группе дополнения`;
}

export function getTagHint(tag: string): TagInfo | undefined {
  const computedShared = COMPUTED_SHARED_TAGS[tag];
  if (computedShared) {
    return {
      tag,
      label: computedShared.label,
      hint: computedShared.hint,
      computed: true,
    };
  }

  const m = tag.match(AUTHOR_TAG_RE);
  if (m) {
    const [, slot, key] = m;
    const field = authorByKey.get(key);
    if (field) {
      return {
        tag,
        label: `${field.label} (${slotLabel(slot)})`,
        hint: field.hint,
        computed: false,
        authorSlot: slot,
      };
    }
    const computed = COMPUTED_AUTHOR_TAGS[key];
    if (computed) {
      return {
        tag,
        label: `${computed.label} (${slotLabel(slot)})`,
        hint: computed.hint,
        computed: true,
        authorSlot: slot,
      };
    }
    return undefined;
  }

  if (tag.startsWith(TAG_PREFIX)) {
    const field = sharedByKey.get(tag.slice(TAG_PREFIX.length));
    if (field)
      return { tag, label: field.label, hint: field.hint, computed: false };
  }
  return undefined;
}
