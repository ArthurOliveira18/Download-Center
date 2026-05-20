import { getAppsData, writeAppsData } from "@/services/dataRepository";
import { resolveLinkedGuideFromForm } from "@/services/linkedGuideService";
import { isSupabaseAdminConfigured } from "@/services/supabase/config";
import { createSupabaseInternalApp, deleteSupabaseInternalApp, updateSupabaseInternalApp } from "@/services/supabase/internalAppsSupabaseService";
import { deleteDownloadFile } from "@/services/supabase/storageService";
import { getUploadedDownloadReferenceFromForm } from "@/services/uploads/formUploadReference";
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

  if (!useSupabase) {
    return { ok: false, error: "Configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY e SUPABASE_STORAGE_BUCKET para cadastrar aplicativos no Supabase." };
  }

  const id = slugify(nome.value);

  if (internalApps.some((app) => app.id === id)) {
    return { ok: false, error: "Ja existe um aplicativo interno com este nome." };
  }

  const metadados = getOptionalText(formData, "metadados");
  const linkedGuide = linkedGuideResult.guide;
  const upload = getUploadedDownloadReferenceFromForm(formData, {
    folder: "apps",
    requiredMessage: "Envie o arquivo do aplicativo antes de cadastrar."
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
      originalName: upload.originalName || upload.fileName || "",
      fileName: upload.fileName || upload.originalName || "",
      fileSizeBytes: upload.fileSizeBytes || 0,
      fileType: upload.fileType || "application/octet-stream",
      localPath: upload.storagePath || "",
      downloadUrl: upload.downloadUrl || "",
      storagePath: upload.storagePath || ""
    },
    status: upload.downloadUrl ? "Disponivel" : "Em preparacao"
  };

  if (useSupabase) {
    try {
      const createdApp = await createSupabaseInternalApp(app);
      return { ok: true, app: createdApp };
    } catch (error) {
      if (upload.storagePath) {
        await deleteDownloadFile(upload.storagePath);
      }

      return {
        ok: false,
        error: `Arquivo enviado, mas nao foi possivel salvar o aplicativo no banco. O envio foi revertido. ${error.message}`
      };
    }
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

export async function deleteInternalAppFromForm(formData) {
  const internalApps = await getAppsData();
  const useSupabase = isSupabaseAdminConfigured();
  const id = getRequiredText(formData, "id", "Aplicativo nao informado.");

  if (id.error) {
    return { ok: false, error: id.error };
  }

  const app = internalApps.find((item) => item.id === id.value);

  if (!app) {
    return { ok: false, error: "Aplicativo nao encontrado." };
  }

  if (useSupabase) {
    await deleteSupabaseInternalApp(id.value);
    return { ok: true, id: id.value, app };
  }

  await writeApps(internalApps.filter((item) => item.id !== id.value));
  return { ok: true, id: id.value, app };
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

