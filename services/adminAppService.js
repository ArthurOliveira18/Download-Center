import { getAppsData, writeAppsData } from "@/services/dataRepository";
import { resolveLinkedGuideFromForm } from "@/services/linkedGuideService";
import { isSupabaseAdminConfigured } from "@/services/supabase/config";
import { createSupabaseInternalApp, updateSupabaseInternalApp } from "@/services/supabase/internalAppsSupabaseService";
import { uploadDownloadFile } from "@/services/supabase/storageService";
import { saveInternalAppFile } from "@/services/storage/localDriverStorage";
import { normalizeText, tokenize } from "@/utils/search";
import { slugify } from "@/utils/slug";

const defaultInternalAppCategory = "Aplicativo interno";

export async function createInternalAppFromForm(formData) {
  const internalApps = await getAppsData();
  const useSupabase = isSupabaseAdminConfigured();
  const nome = getRequiredText(formData, "nome", "Informe o nome.");
  const categoria = getOptionalText(formData, "categoria") || defaultInternalAppCategory;
  const descricao = getOptionalText(formData, "descricao");
  const linkedGuideResult = await resolveLinkedGuideFromForm(formData);

  const validationError = nome.error || linkedGuideResult.error;

  if (validationError) {
    return { ok: false, error: validationError };
  }

  if (!hasFile(formData.get("arquivo"))) {
    return { ok: false, error: "Selecione o arquivo do aplicativo." };
  }

  const id = slugify(nome.value);

  if (internalApps.some((app) => app.id === id)) {
    return { ok: false, error: "Ja existe um aplicativo interno com este nome." };
  }

  const metadados = getOptionalText(formData, "metadados");
  const linkedGuide = linkedGuideResult.guide;
  const upload = useSupabase
    ? await uploadDownloadFile({
        file: formData.get("arquivo"),
        folder: "apps",
        nameParts: [nome.value, getOptionalText(formData, "versao") || "app"]
      })
    : await saveInternalAppFile({
        file: formData.get("arquivo"),
        nome: nome.value,
        versao: getOptionalText(formData, "versao")
      });

  if (!upload.ok) {
    return upload;
  }

  const app = {
    id,
    nome: nome.value,
    categoria,
    descricao,
    versao: getOptionalText(formData, "versao"),
    observacoes: getList(formData, "observacoes"),
    metadados,
    keywords: uniqueValues([
      ...getList(formData, "metadados"),
      ...(linkedGuide?.titulo ? tokenize(linkedGuide.titulo) : []),
      ...tokenize(`${nome.value} ${categoria}`)
    ]),
    guiaVinculado: linkedGuide,
    destaque: false,
    download: {
      nome: nome.value,
      localPath: upload.localPath || upload.storagePath || "",
      downloadUrl: upload.downloadUrl || "",
      storagePath: upload.storagePath || ""
    },
    status: upload.downloadUrl ? "Disponivel" : "Em preparacao"
  };

  if (useSupabase) {
    const createdApp = await createSupabaseInternalApp(app);
    return { ok: true, app: createdApp };
  }

  await writeApps([...internalApps, app]);

  return { ok: true, app };
}

export async function updateInternalAppEditableFieldsFromForm(formData) {
  const internalApps = await getAppsData();
  const useSupabase = isSupabaseAdminConfigured();
  const id = getRequiredText(formData, "id", "Aplicativo nao informado.");

  if (id.error) {
    return { ok: false, error: id.error };
  }

  const appIndex = internalApps.findIndex((app) => app.id === id.value);

  if (appIndex === -1) {
    return { ok: false, error: "Aplicativo nao encontrado." };
  }

  const nome = getRequiredText(formData, "nome", "Informe o nome.");
  const categoria = getOptionalText(formData, "categoria") || defaultInternalAppCategory;
  const descricao = getOptionalText(formData, "descricao");
  const linkedGuideResult = await resolveLinkedGuideFromForm(formData);

  const validationError = nome.error || linkedGuideResult.error;

  if (validationError) {
    return { ok: false, error: validationError };
  }

  const metadados = getOptionalText(formData, "metadados");
  const linkedGuide = linkedGuideResult.guide;
  const nextApps = internalApps.map((app, index) => {
    if (index !== appIndex) {
      return app;
    }

    return {
      ...app,
      nome: nome.value,
      categoria,
      descricao,
      versao: getOptionalText(formData, "versao"),
      observacoes: getList(formData, "observacoes"),
      metadados,
      guiaVinculado: linkedGuide,
      keywords: uniqueValues([
        ...(app.keywords || []),
        ...getList(formData, "metadados"),
        ...(linkedGuide?.titulo ? tokenize(linkedGuide.titulo) : []),
        ...tokenize(`${nome.value} ${categoria} ${metadados}`)
      ])
    };
  });

  if (useSupabase) {
    const updatedApp = await updateSupabaseInternalApp(id.value, nextApps[appIndex]);
    return {
      ok: true,
      app: updatedApp
    };
  }

  await writeApps(nextApps);

  return {
    ok: true,
    app: nextApps[appIndex]
  };
}

async function writeApps(nextApps) {
  await writeAppsData(nextApps);
}

function getRequiredText(formData, key, error) {
  const value = getOptionalText(formData, key);

  if (!value) {
    return { error };
  }

  return { value };
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

function uniqueValues(values) {
  return [...new Set(values.map((value) => normalizeText(value)).filter(Boolean))];
}

function hasFile(file) {
  return Boolean(file && typeof file.arrayBuffer === "function" && file.size > 0);
}
