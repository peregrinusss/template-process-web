/** Значения полей: ключ из config/fields.ts */
export type FieldValues = Record<string, string>;

export interface AuthorData {
  /** Стабильный id для React-ключей и вкладок */
  id: string;
  values: FieldValues;
}

export interface FormState {
  shared: FieldValues;
  authors: AuthorData[];
}

/** Данные для docxtemplater: строки и массив авторов для циклов */
export type TemplateData = Record<string, string | TemplateData[]>;
