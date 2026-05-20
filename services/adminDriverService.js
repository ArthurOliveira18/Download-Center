import { getDriversData, writeDriversData } from "@/services/dataRepository";
import { resolveLinkedGuideFromForm } from "@/services/linkedGuideService";
import { isSupabaseAdminConfigured } from "@/services/supabase/config";
import { createSupabaseDriver, deleteSupabaseDriver, updateSupabaseDriver } from "@/services/supabase/driversSupabaseService";
import { deleteDownloadFile } from "@/services/supabase/storageService";
import { getUploadedDownloadReferenceFromForm } from "@/services/uploads/formUploadReference";
import { normalizeText, tokenize } from "@/utils/search";
import { slugify } from "@/utils/slug";

const thermalPrinterCategory = "Impressora termica";

export async function createDriverFromForm(formData) {
  const drivers = await getDriversData();
  const useSupabase = isSupabaseAdminConfigured();
  const marca = getRequiredText(formData, "marca", "Informe a marca.");
  const modelo = getRequiredText(formData, "modelo", "Informe o modelo.");
  const driverName = getRequiredText(formData, "driverName", "Informe o nome.");
  const versao = getOptionalText(formData, "versao");
  const descricao = getOptionalText(formData, "descricao");
  const compatibilidade = getList(formData, "compatibilidade");
  const keywords = getList(formData, "keywords");
  const guiaTitulo = getOptionalText(formData, "guiaTitulo") || `Como instalar ${marca.value} ${modelo.value}`;
  const destaque = formData.get("destaque") === "on";
  const linkedGuideResult = await resolveLinkedGuideFromForm(formData);

  const validationError =
    marca.error ||
    modelo.error ||
    driverName.error ||
    linkedGuideResult.error;

  if (validationError) {
    return { ok: false, error: validationError };
  }

  if (!useSupabase) {
    return { ok: false, error: "Configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY e SUPABASE_STORAGE_BUCKET para cadastrar drivers no Supabase." };
  }

  const duplicate = drivers.find((driver) => {
    return (
      normalizeText(driver.marca) === normalizeText(marca.value) &&
      normalizeText(driver.modelo) === normalizeText(modelo.value)
    );
  });

  if (duplicate) {
    return {
      ok: false,
      error: `Ja existe um driver cadastrado para ${duplicate.marca} ${duplicate.modelo}.`
    };
  }

  const upload = getUploadedDownloadReferenceFromForm(formData, {
    folder: "drivers",
    requiredMessage: "Envie o arquivo do driver antes de cadastrar."
  });

  if (!upload.ok) {
    return upload;
  }

  const id = `${slugify(marca.value)}-${slugify(modelo.value)}`;
  const guideUrl = `/guias/${slugify(marca.value)}/${slugify(modelo.value)}`;
  const linkedGuide = linkedGuideResult.guide;
  const normalizedKeywords = uniqueValues([
    ...keywords,
    ...tokenize(`${marca.value} ${modelo.value} ${thermalPrinterCategory} ${driverName.value}`),
    ...(linkedGuide?.titulo ? tokenize(linkedGuide.titulo) : []),
    "driver"
  ]);
  const versionLabel = versao || "Atual";

  const newDriver = {
    id,
    marca: marca.value,
    modelo: modelo.value,
    categoria: thermalPrinterCategory,
    descricao,
    compatibilidade,
    keywords: normalizedKeywords,
    destaque,
    driver: {
      nome: driverName.value,
      versao,
      originalName: upload.originalName || upload.fileName || "",
      fileName: upload.fileName || upload.originalName || "",
      fileSizeBytes: upload.fileSizeBytes || 0,
      fileType: upload.fileType || "application/octet-stream",
      localPath: upload.storagePath,
      downloadUrl: upload.downloadUrl,
      storagePath: upload.storagePath || "",
      versoes: [
        {
          nome: versionLabel,
          downloadUrl: upload.downloadUrl,
          fileSizeBytes: upload.fileSizeBytes || 0,
          fileType: upload.fileType || "application/octet-stream",
          localPath: upload.storagePath,
          storagePath: upload.storagePath || ""
        }
      ]
    },
    guiaVinculado: linkedGuide,
    guiaInstalacao: {
      titulo: linkedGuide?.type === "guide" ? linkedGuide.titulo : guiaTitulo,
      url: linkedGuide?.type === "guide" ? linkedGuide.url : guideUrl,
      passos: [
        "Baixe o driver de impressora termica cadastrado no Download Center.",
        "Extraia o arquivo, quando aplicavel.",
        "Execute o instalador como administrador.",
        "Configure a porta USB, serial ou rede.",
        "Finalize com uma impressao de teste."
      ]
    }
  };

  if (useSupabase) {
    try {
      const createdDriver = await createSupabaseDriver(newDriver);
      return {
        ok: true,
        driver: createdDriver
      };
    } catch (error) {
      if (upload.storagePath) {
        await deleteDownloadFile(upload.storagePath);
      }

      return {
        ok: false,
        error: `Arquivo enviado, mas nao foi possivel salvar o driver no banco. O envio foi revertido. ${error.message}`
      };
    }
  }

  await appendDriver(drivers, newDriver);
  
  return {
    ok: true,
    driver: newDriver
  };
}

export async function updateDriverEditableFieldsFromForm(formData) {
  const drivers = await getDriversData();
  const useSupabase = isSupabaseAdminConfigured();
  const id = getRequiredText(formData, "id", "Driver nao informado.");

  if (id.error) {
    return { ok: false, error: id.error };
  }

  const driverIndex = drivers.findIndex((driver) => driver.id === id.value);

  if (driverIndex === -1) {
    return { ok: false, error: "Driver nao encontrado." };
  }

  const driverName = getRequiredText(formData, "driverName", "Informe o nome.");
  const versao = getOptionalText(formData, "versao");
  const descricao = getOptionalText(formData, "descricao");
  const linkedGuideResult = await resolveLinkedGuideFromForm(formData);

  const validationError = driverName.error || linkedGuideResult.error;

  if (validationError) {
    return { ok: false, error: validationError };
  }

  const metadados = getOptionalText(formData, "metadados");
  const linkedGuide = linkedGuideResult.guide;
  const nextDrivers = drivers.map((driver, index) => {
    if (index !== driverIndex) {
      return driver;
    }

    const guiaInstalacao =
      linkedGuide?.type === "guide"
        ? {
          ...(driver.guiaInstalacao || {}),
          titulo: linkedGuide.titulo,
          url: linkedGuide.url
        }
        : driver.guiaInstalacao;

    return {
      ...driver,
      categoria: thermalPrinterCategory,
      descricao,
      compatibilidade: getList(formData, "compatibilidade"),
      observacoes: getList(formData, "observacoes"),
      metadados,
      guiaVinculado: linkedGuide,
      guiaInstalacao,
      keywords: uniqueValues([
        ...(driver.keywords || []),
        ...getList(formData, "metadados"),
        ...(linkedGuide?.titulo ? tokenize(linkedGuide.titulo) : []),
        ...tokenize(`${driver.marca} ${driver.modelo} ${thermalPrinterCategory} ${driverName.value} ${versao}`)
      ]),
      driver: {
        ...driver.driver,
        nome: driverName.value,
        versao,
        versoes: (driver.driver?.versoes || []).map((item, versionIndex) => ({
          ...item,
          nome: versionIndex === 0 ? versao || item.nome : item.nome
        }))
      }
    };
  });

  if (useSupabase) {
    const updatedDriver = await updateSupabaseDriver(id.value, nextDrivers[driverIndex]);
    return {
      ok: true,
      driver: updatedDriver
    };
  }

  await writeDrivers(nextDrivers);

  return {
    ok: true,
    driver: nextDrivers[driverIndex]
  };
}

export async function deleteDriverFromForm(formData) {
  const drivers = await getDriversData();
  const useSupabase = isSupabaseAdminConfigured();
  const id = getRequiredText(formData, "id", "Driver nao informado.");

  if (id.error) {
    return { ok: false, error: id.error };
  }

  const driver = drivers.find((item) => item.id === id.value);

  if (!driver) {
    return { ok: false, error: "Driver nao encontrado." };
  }

  if (useSupabase) {
    await deleteSupabaseDriver(id.value);
    return { ok: true, id: id.value, driver };
  }

  await writeDrivers(drivers.filter((item) => item.id !== id.value));
  return { ok: true, id: id.value, driver };
}

async function appendDriver(drivers, newDriver) {
  const nextDrivers = [...drivers, newDriver];
  await writeDrivers(nextDrivers);
}

async function writeDrivers(nextDrivers) {
  await writeDriversData(nextDrivers);
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
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

