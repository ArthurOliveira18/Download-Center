import fs from "node:fs/promises";
import path from "node:path";
import { drivers } from "@/data/drivers";
import { resolveLinkedGuideFromForm } from "@/services/linkedGuideService";
import { saveDriverFile } from "@/services/storage/localDriverStorage";
import { normalizeText, tokenize } from "@/utils/search";
import { slugify } from "@/utils/slug";

const dataFilePath = path.join(process.cwd(), "data", "drivers.js");

export async function createDriverFromForm(formData) {
  const marca = getRequiredText(formData, "marca", "Informe a marca.");
  const modelo = getRequiredText(formData, "modelo", "Informe o modelo.");
  const categoria = getRequiredText(formData, "categoria", "Informe a categoria.");
  const driverName = getRequiredText(formData, "driverName", "Informe o nome do driver.");
  const versao = getRequiredText(formData, "versao", "Informe a versao do driver.");
  const descricao = getRequiredText(formData, "descricao", "Informe a descricao do driver.");
  const compatibilidade = getList(formData, "compatibilidade");
  const keywords = getList(formData, "keywords");
  const guiaTitulo = getOptionalText(formData, "guiaTitulo") || `Como instalar ${marca.value} ${modelo.value}`;
  const destaque = formData.get("destaque") === "on";
  const linkedGuideResult = resolveLinkedGuideFromForm(formData);

  const validationError =
    marca.error ||
    modelo.error ||
    categoria.error ||
    driverName.error ||
    versao.error ||
    descricao.error ||
    linkedGuideResult.error;

  if (validationError) {
    return { ok: false, error: validationError };
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

  const upload = await saveDriverFile({
    file: formData.get("arquivo"),
    marca: marca.value,
    modelo: modelo.value,
    versao: versao.value
  });

  if (!upload.ok) {
    return upload;
  }

  const id = `${slugify(marca.value)}-${slugify(modelo.value)}`;
  const guideUrl = `/guias/${slugify(marca.value)}/${slugify(modelo.value)}`;
  const linkedGuide = linkedGuideResult.guide;
  const normalizedKeywords = uniqueValues([
    ...keywords,
    ...tokenize(`${marca.value} ${modelo.value} ${categoria.value} ${driverName.value}`),
    ...(linkedGuide?.titulo ? tokenize(linkedGuide.titulo) : []),
    "driver"
  ]);

  const newDriver = {
    id,
    marca: marca.value,
    modelo: modelo.value,
    categoria: categoria.value,
    descricao: descricao.value,
    compatibilidade,
    keywords: normalizedKeywords,
    destaque,
    driver: {
      nome: driverName.value,
      versao: versao.value,
      localPath: upload.localPath,
      downloadUrl: upload.downloadUrl,
      versoes: [
        {
          nome: versao.value,
          downloadUrl: upload.downloadUrl,
          localPath: upload.localPath
        }
      ]
    },
    guiaVinculado: linkedGuide,
    guiaInstalacao: {
      titulo: linkedGuide?.type === "guide" ? linkedGuide.titulo : guiaTitulo,
      url: linkedGuide?.type === "guide" ? linkedGuide.url : guideUrl,
      passos: [
        "Baixe o driver cadastrado no Download Center.",
        "Extraia o arquivo, quando aplicavel.",
        "Execute o instalador como administrador.",
        "Configure a porta USB, serial ou rede.",
        "Finalize com uma impressao de teste."
      ]
    }
  };

  await appendDriver(newDriver);

  return {
    ok: true,
    driver: newDriver
  };
}

export async function updateDriverEditableFieldsFromForm(formData) {
  const id = getRequiredText(formData, "id", "Driver nao informado.");

  if (id.error) {
    return { ok: false, error: id.error };
  }

  const driverIndex = drivers.findIndex((driver) => driver.id === id.value);

  if (driverIndex === -1) {
    return { ok: false, error: "Driver nao encontrado." };
  }

  const driverName = getRequiredText(formData, "driverName", "Informe o nome do driver.");
  const categoria = getRequiredText(formData, "categoria", "Informe a categoria.");
  const versao = getRequiredText(formData, "versao", "Informe a versao do driver.");
  const descricao = getRequiredText(formData, "descricao", "Informe a descricao.");
  const linkedGuideResult = resolveLinkedGuideFromForm(formData);

  const validationError = driverName.error || categoria.error || versao.error || descricao.error || linkedGuideResult.error;

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
      categoria: categoria.value,
      descricao: descricao.value,
      compatibilidade: getList(formData, "compatibilidade"),
      observacoes: getList(formData, "observacoes"),
      metadados,
      guiaVinculado: linkedGuide,
      guiaInstalacao,
      keywords: uniqueValues([
        ...(driver.keywords || []),
        ...getList(formData, "metadados"),
        ...(linkedGuide?.titulo ? tokenize(linkedGuide.titulo) : []),
        ...tokenize(`${driver.marca} ${driver.modelo} ${categoria.value} ${driverName.value} ${versao.value}`)
      ]),
      driver: {
        ...driver.driver,
        nome: driverName.value,
        versao: versao.value,
        versoes: (driver.driver?.versoes || []).map((item, versionIndex) => ({
          ...item,
          nome: versionIndex === 0 ? versao.value : item.nome
        }))
      }
    };
  });

  await writeDrivers(nextDrivers);

  return {
    ok: true,
    driver: nextDrivers[driverIndex]
  };
}

async function appendDriver(newDriver) {
  const nextDrivers = [...drivers, newDriver];
  await writeDrivers(nextDrivers);
}

async function writeDrivers(nextDrivers) {
  const fileContents = `export const drivers = ${JSON.stringify(nextDrivers, null, 2)};\n`;

  await fs.writeFile(dataFilePath, fileContents, "utf8");
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
