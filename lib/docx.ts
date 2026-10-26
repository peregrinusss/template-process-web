import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import type { TemplateData } from "@/types";

/**
 * Заполнить .docx шаблон. Синтаксис тегов - {key_ria_*},
 * циклы - {#key_ria_authors}…{/key_ria_authors}.
 * Незаполненные теги превращаются в пустую строку.
 */
export function renderDocx(
  template: ArrayBuffer | Uint8Array,
  data: TemplateData,
): Uint8Array {
  const doc = new Docxtemplater(new PizZip(template), {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });
  doc.render(data);
  return doc.getZip().generate({ type: "uint8array", compression: "DEFLATE" });
}
