import { getGuidesData, writeGuidesData } from "@/services/dataRepository";
import { isSupabaseAdminConfigured } from "@/services/supabase/config";
import { createSupabaseGuide, deleteSupabaseGuides, updateSupabaseGuide } from "@/services/supabase/guidesSupabaseService";
import { normalizeText, tokenize } from "@/utils/search";
import { slugify } from "@/utils/slug";

export async function createGuideFromForm(formData) {
  try {
    const guides = await getGuidesData();
    const useSupabase = isSupabaseAdminConfigured();
    const guide = buildGuideFromForm(formData);
    const duplicate = guides.find((item) => item.id === guide.id || item.slug === guide.slug);

    if (duplicate) {
      return { ok: false, error: "Ja existe um guia manual com este nome, marca e modelo." };
    }

    if (useSupabase) {
      return { ok: true, guide: await createSupabaseGuide(guide, "guide") };
    }

    await writeGuides([...guides, guide]);
    return { ok: true, guide };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function updateGuideFromForm(formData) {
  try {
    const guides = await getGuidesData();
    const useSupabase = isSupabaseAdminConfigured();
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

    if (useSupabase) {
      return { ok: true, guide: await updateSupabaseGuide(id.value, updatedGuide, "guide") };
    }

    await writeGuides(nextGuides);
    return { ok: true, guide: updatedGuide };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function deleteGuideFromForm(formData) {
  const guides = await getGuidesData();
  const useSupabase = isSupabaseAdminConfigured();
  const id = getRequiredText(formData, "id", "Guia nao informado.");

  if (id.error) {
    return { ok: false, error: id.error };
  }

  const exists = guides.some((guide) => guide.id === id.value);

  if (!exists) {
    return { ok: false, error: "Guia nao encontrado." };
  }

  if (useSupabase) {
    await deleteSupabaseGuides([id.value], "guide");
    return { ok: true, id: id.value };
  }

  await writeGuides(guides.filter((guide) => guide.id !== id.value));
  return { ok: true, id: id.value };
}

export async function deleteGuidesFromForm(formData) {
  const guides = await getGuidesData();
  const useSupabase = isSupabaseAdminConfigured();
  const ids = uniqueIds(formData.getAll("ids"));

  if (!ids.length) {
    return { ok: false, error: "Selecione pelo menos um guia para excluir." };
  }

  const existingIds = new Set(guides.map((guide) => guide.id));
  const invalidId = ids.find((id) => !existingIds.has(id));

  if (invalidId) {
    return { ok: false, error: "Um dos guias selecionados nao foi encontrado." };
  }

  if (useSupabase) {
    const count = await deleteSupabaseGuides(ids, "guide");
    return { ok: true, ids, count };
  }

  await writeGuides(guides.filter((guide) => !ids.includes(guide.id)));
  return { ok: true, ids, count: ids.length };
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

  const slug = `${slugify(titulo)}-${slugify(marca)}-${slugify(modelo)}`;

  return {
    id: slug,
    slug,
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
  await writeGuidesData(nextGuides);
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

function uniqueIds(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function must(result) {
  if (result.error) {
    throw new Error(result.error);
  }

  return result.value;
}
