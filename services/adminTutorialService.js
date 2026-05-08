import fs from "node:fs/promises";
import path from "node:path";
import { tutorials } from "@/data/tutorials";
import { normalizeText, tokenize } from "@/utils/search";
import { slugify } from "@/utils/slug";

const tutorialDataFilePath = path.join(process.cwd(), "data", "tutorials.js");

export async function createTutorialFromForm(formData) {
  try {
    const tutorial = buildTutorialFromForm(formData);

    if (tutorials.some((item) => item.id === tutorial.id)) {
      return { ok: false, error: "Ja existe um tutorial com este nome." };
    }

    await writeTutorials([...tutorials, tutorial]);
    return { ok: true, tutorial };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function updateTutorialFromForm(formData) {
  try {
    const id = must(getRequiredText(formData, "id", "Tutorial nao informado."));
    const tutorialIndex = tutorials.findIndex((tutorial) => tutorial.id === id);

    if (tutorialIndex === -1) {
      return { ok: false, error: "Tutorial nao encontrado." };
    }

    const updatedTutorial = {
      ...buildTutorialFromForm(formData),
      id
    };

    await writeTutorials(tutorials.map((tutorial, index) => (index === tutorialIndex ? updatedTutorial : tutorial)));
    return { ok: true, tutorial: updatedTutorial };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function deleteTutorialFromForm(formData) {
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    return { ok: false, error: "Tutorial nao informado." };
  }

  if (!tutorials.some((tutorial) => tutorial.id === id)) {
    return { ok: false, error: "Tutorial nao encontrado." };
  }

  await writeTutorials(tutorials.filter((tutorial) => tutorial.id !== id));
  return { ok: true, id };
}

function buildTutorialFromForm(formData) {
  const titulo = must(getRequiredText(formData, "titulo", "Informe o nome do tutorial."));
  const categoria = must(getRequiredText(formData, "categoria", "Informe a categoria."));
  const descricao = must(getRequiredText(formData, "descricao", "Informe a descricao."));

  return {
    id: slugify(titulo),
    titulo,
    categoria,
    descricao,
    keywords: uniqueValues([...getList(formData, "keywords"), ...tokenize(`${titulo} ${categoria}`)]),
    observacoes: getList(formData, "observacoes"),
    errosComuns: getIssues(formData),
    passos: getListFromRepeatedFields(formData, "passos")
  };
}

async function writeTutorials(nextTutorials) {
  const fileContents = `export const tutorials = ${JSON.stringify(nextTutorials, null, 2)};\n`;
  await fs.writeFile(tutorialDataFilePath, fileContents, "utf8");
}

function getIssues(formData) {
  return getListFromRepeatedFields(formData, "errosComuns").map((item) => {
    const [problema, solucao] = item.split("=>").map((part) => part.trim());
    return {
      problema: problema || item,
      solucao: solucao || "Revise configuracao, comunicacao, driver e porta."
    };
  });
}

function getRequiredText(formData, key, error) {
  const value = String(formData.get(key) || "").trim();
  return value ? { value } : { error };
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
