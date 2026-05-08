import fs from "node:fs/promises";
import path from "node:path";
import { guides } from "@/data/guides";
import { normalizeText, tokenize } from "@/utils/search";
import { slugify } from "@/utils/slug";

const guideDataFilePath = path.join(process.cwd(), "data", "guides.js");

export async function createGuideFromForm(formData) {
  try {
    const guide = buildGuideFromForm(formData);
    const duplicate = guides.find((item) => item.id === guide.id);

    if (duplicate) {
      return { ok: false, error: "Ja existe um guia manual com este nome, marca e modelo." };
    }

    await writeGuides([...guides, guide]);
    return { ok: true, guide };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function updateGuideFromForm(formData) {
  try {
    const id = getRequiredText(formData, "id", "Guia nao informado.");

    if (id.error) {
      return { ok: false, error: id.error };
    }

    const guideIndex = guides.findIndex((guide) => guide.id === id.value);

    if (guideIndex === -1) {
      return { ok: false, error: "Guia nao encontrado." };
    }

    const updatedGuide = {
      ...buildGuideFromForm(formData),
      id: id.value
    };
    const nextGuides = guides.map((guide, index) => (index === guideIndex ? updatedGuide : guide));

    await writeGuides(nextGuides);
    return { ok: true, guide: updatedGuide };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function deleteGuideFromForm(formData) {
  const id = getRequiredText(formData, "id", "Guia nao informado.");

  if (id.error) {
    return { ok: false, error: id.error };
  }

  const exists = guides.some((guide) => guide.id === id.value);

  if (!exists) {
    return { ok: false, error: "Guia nao encontrado." };
  }

  await writeGuides(guides.filter((guide) => guide.id !== id.value));
  return { ok: true, id: id.value };
}

function buildGuideFromForm(formData) {
  const titulo = must(getRequiredText(formData, "titulo", "Informe o nome do guia."));
  const marca = must(getRequiredText(formData, "marca", "Informe a marca."));
  const modelo = must(getRequiredText(formData, "modelo", "Informe o modelo."));
  const categoria = must(getRequiredText(formData, "categoria", "Informe a categoria."));
  const descricao = must(getRequiredText(formData, "descricao", "Informe a descricao."));
  const keywords = uniqueValues([
    ...getList(formData, "keywords"),
    ...tokenize(`${titulo} ${marca} ${modelo} ${categoria}`),
    "guia",
    "instalacao"
  ]);

  return {
    id: `${slugify(titulo)}-${slugify(marca)}-${slugify(modelo)}`,
    titulo,
    marca,
    modelo,
    categoria,
    driverRelacionadoId: getOptionalText(formData, "driverRelacionadoId"),
    aplicativoRelacionadoId: getOptionalText(formData, "aplicativoRelacionadoId"),
    descricao,
    keywords,
    compatibilidade: getList(formData, "compatibilidade"),
    observacoes: getList(formData, "observacoes"),
    errosComuns: getIssues(formData),
    passos: getListFromRepeatedFields(formData, "passos")
  };
}

async function writeGuides(nextGuides) {
  const fileContents = `export const guides = ${JSON.stringify(nextGuides, null, 2)};\n`;
  await fs.writeFile(guideDataFilePath, fileContents, "utf8");
}

function getIssues(formData) {
  return getListFromRepeatedFields(formData, "errosComuns").map((item) => {
    const [problema, solucao] = item.split("=>").map((part) => part.trim());
    return {
      problema: problema || item,
      solucao: solucao || "Revise configuracao, porta, cabo e driver."
    };
  });
}

function getRequiredText(formData, key, error) {
  const value = getOptionalText(formData, key);
  return value ? { value } : { error };
}

function getOptionalText(formData, key) {
  return String(formData.get(key) || "").trim();
}

function getList(formData, key) {
  return String(formData.get(key) || "")
    .split(/[\n,;]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getListFromRepeatedFields(formData, key) {
  return formData
    .getAll(key)
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function uniqueValues(values) {
  return [...new Set(values.map((value) => normalizeText(value)).filter(Boolean))];
}

function must(result) {
  if (result.error) {
    throw new Error(result.error);
  }

  return result.value;
}
