import type { FormState } from "@/types";
import { createAuthor, createForm } from "./form";

const PEOPLE = [["Иванов", "Иван", "Иванович"]];

// Тестовые данные для проверки генерации без заполнения формы
export function createDemoForm(authorCount = 1): FormState {
  const form = createForm(authorCount);
  Object.assign(form.shared, {
    type: "pr",
    title: "Генератор пакета документов для регистрации РИД",
    annotation:
      "Веб-приложение для автоматического заполнения пакета документов для регистрации программ для ЭВМ и баз данных.",
    specification:
      "Заполнение шаблонов в браузере, поддержка нескольких авторов, автосохранение формы.",
    programming_language: "TypeScript",
    code_size: "120 КБ",
    code: 'export function hello() {\n  return "Привет, РУДН";\n}',
    nir: "-",
    address: "author@pfur.ru",
    department_title: "Факультет физико-математических и естественных наук",
    department_contacts: "+7 (495) 000-00-00",
    docs_submission_responsible_fullname_short: "Петров П. П.",
    rector_fullname_long_rod: "Тестова Теста Тестовича",
    rector_fullname_short: "Т. Т. Тестов",
    proxy: "№ 0000 от 01.01.2026",
  });
  form.authors = PEOPLE.slice(0, authorCount).map(
    ([lastname, firstname, middlename], i) =>
      createAuthor({
        lastname,
        firstname,
        middlename,
        dob: `199${i}-0${(i % 9) + 1}-1${i}`,
        address: `Россия, 117198, г. Москва, ул. Миклухо-Маклая, д. 6, кв. ${i + 1}`,
        id_document: `паспорт 45 0${i} 12345${i}, выдан ГУ МВД России по г. Москве 01.01.2020`,
        snils: `123-456-789 0${i}`,
        post: i === 0 ? "доцент" : "аспирант",
        contribution: "Разработка архитектуры и программного кода",
        data: `р/с 4081781000000000000${i}`,
        bank: "ПАО Сбербанк, БИК 044525225",
      }),
  );
  return form;
}
