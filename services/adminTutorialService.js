import { getTutorialsData, writeTutorialsData } from "@/services/dataRepository";
import { isSupabaseAdminConfigured } from "@/services/supabase/config";
import { createSupabaseGuide, deleteSupabaseGuides, updateSupabaseGuide } from "@/services/supabase/guidesSupabaseService";
import { normalizeText, tokenize } from "@/utils/search";
import { slugify } from "@/utils/slug";

export async function createTutorialFromForm(formData) {
  try {
    const tutorials = await getTutorialsData();
    const useSupabase = isSupabaseAdminConfigured();
    const tutorial = buildTutorialFromForm(formData);

    if (tutorials.some((item) => item.id === tutorial.id || item.slug === tutorial.slug)) {
      return { ok: false, error: "Ja existe um tutorial com este nome." };
    }

    if (useSupabase) {
      return { ok: true, tutorial: await createSupabaseGuide(tutorial, "tutorial") };
    }

    await writeTutorials([...tutorials, tutorial]);
    return { ok: true, tutorial };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function updateTutorialFromForm(formData) {
  try {
    const tutorials = await getTutorialsData();
    const useSupabase = isSupabaseAdminConfigured();
    const id = must(getRequiredText(formData, "id", "Tutorial nao informado."));
    const tutorialIndex = tutorials.findIndex((tutorial) => tutorial.id === id);

    if (tutorialIndex === -1) {
      return { ok: false, error: "Tutorial nao encontrado." };
    }

    const updatedTutorial = {
      ...buildTutorialFromForm(formData),
      id
    };

    if (useSupabase) {
      return { ok: true, tutorial: await updateSupabaseGuide(id, updatedTutorial, "tutorial") };
    }

    await writeTutorials(tutorials.map((tutorial, index) => (index === tutorialIndex ? updatedTutorial : tutorial)));
    return { ok: true, tutorial: updatedTutorial };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function deleteTutorialFromForm(formData) {
  const tutorials = await getTutorialsData();
  const useSupabase = isSupabaseAdminConfigured();
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    return { ok: false, error: "Tutorial nao informado." };
  }

  if (!tutorials.some((tutorial) => tutorial.id === id)) {
    return { ok: false, error: "Tutorial nao encontrado." };
  }

  if (useSupabase) {
    await deleteSupabaseGuides([id], "tutorial");
    return { ok: true, id };
  }

  await writeTutorials(tutorials.filter((tutorial) => tutorial.id !== id));
  return { ok: true, id };
}

export async function deleteTutorialsFromForm(formData) {
  const tutorials = await getTutorialsData();
  const useSupabase = isSupabaseAdminConfigured();
  const ids = uniqueIds(formData.getAll("ids"));

  if (!ids.length) {
    return { ok: false, error: "Selecione pelo menos um tutorial para excluir." };
  }

  const existingIds = new Set(tutorials.map((tutorial) => tutorial.id));
  const invalidId = ids.find((id) => !existingIds.has(id));

  if (invalidId) {
    return { ok: false, error: "Um dos tutoriais selecionados nao foi encontrado." };
  }

  if (useSupabase) {
    const count = await deleteSupabaseGuides(ids, "tutorial");
    return { ok: true, ids, count };
  }

  await writeTutorials(tutorials.filter((tutorial) => !ids.includes(tutorial.id)));
  return { ok: true, ids, count: ids.length };
}

function buildTutorialFromForm(formData) {
  const titulo = must(getRequiredText(formData, "titulo", "Informe o nome do tutorial."));
  const categoria = must(getRequiredText(formData, "categoria", "Informe a categoria."));
  const descricao = must(getRequiredText(formData, "descricao", "Informe a descricao."));

  const slug = slugify(titulo);

  return {
    id: slug,
    slug,
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
  await writeTutorialsData(nextTutorials);
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

function uniqueIds(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function must(result) {
  if (result.error) {
    throw new Error(result.error);
  }

  return result.value;
}
