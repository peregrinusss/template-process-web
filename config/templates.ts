/**
 * Манифест пакета документов.
 * Порядок массива = порядок файлов в архиве.
 *
 * Стратегии:
 *  - single      один файл на весь пакет; авторы - через цикл {#key_ria_authors}
 *                и key_ria_author1_* (первый автор)
 *  - per-author  отдельная копия на каждого автора (теги key_ria_authorX_*)
 *  - additional  дополнение к заявлению: авторы 2..N группами по 3
 *                (теги key_ria_authorX1_*..X3_*); при одном авторе не создаётся
 */
export type TemplateStrategy = "single" | "per-author" | "additional";

export interface TemplateDef {
  id: string;
  // Файл в public/templates
  file: string;
  // Название выходного документа (без расширения)
  title: string;
  strategy: TemplateStrategy;
}

export const TEMPLATES_BASE_PATH = "/templates";

export const TEMPLATES: TemplateDef[] = [
  {
    id: "uvedomlenie-zayavka",
    file: "uvedomlenie-zayavka.docx",
    title: "Уведомление-заявка",
    strategy: "single",
  },
  {
    id: "uvedomlenie-rid",
    file: "uvedomlenie-rid.docx",
    title: "Уведомление о создании РИД",
    strategy: "single",
  },
  {
    id: "zayavlenie-rp",
    file: "zayavlenie-rp.docx",
    title: "Заявление о регистрации",
    strategy: "single",
  },
  {
    id: "zayavlenie-rp-dop",
    file: "zayavlenie-rp-dop.docx",
    title: "Дополнение к заявлению",
    strategy: "additional",
  },
  {
    id: "soglasie-avtora",
    file: "soglasie-avtora.docx",
    title: "Согласие автора на указание сведений",
    strategy: "per-author",
  },
  {
    id: "soglasie-pd-rospatent",
    file: "soglasie-pd-rospatent.docx",
    title: "Согласие на обработку ПД (Роспатент)",
    strategy: "per-author",
  },
  {
    id: "soglasie-pd",
    file: "soglasie-pd.docx",
    title: "Согласие на обработку ПД",
    strategy: "per-author",
  },
  {
    id: "dogovor-evm",
    file: "dogovor-evm.docx",
    title: "Договор об отчуждении исключительного права",
    strategy: "single",
  },
  { id: "referat", file: "referat.docx", title: "Реферат", strategy: "single" },
  {
    id: "oblozhka-diska",
    file: "oblozhka-diska.docx",
    title: "Обложка для диска",
    strategy: "single",
  },
  {
    id: "titulny-list-listinga",
    file: "titulny-list-listinga.docx",
    title: "Титульный лист листинга",
    strategy: "single",
  },
];

// Сколько авторов помещается на одном листе дополнения
export const ADDITIONAL_GROUP_SIZE = 3;
