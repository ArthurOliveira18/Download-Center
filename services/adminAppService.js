import fs from "node:fs/promises";
import path from "node:path";
import { internalApps } from "@/data/apps";
import { normalizeText, tokenize } from "@/utils/search";
import { slugify } from "@/utils/slug";

const appDataFilePath = path.join(process.cwd(), "data", "apps.js");

export async function createInternalAppFromForm(formData) {
  const nome = getRequiredText(formData, "nome", "Informe o nome do aplicativo.");
  const categoria = getRequiredText(formData, "categoria", "Informe a categoria.");
  const descricao = getRequiredText(formData, "descricao", "Informe a descricao.");

  const validationError = nome.error || categoria.error || descricao.error;

  if (validationError) {
    return { ok: false, error: validationError };
  }

  const id = slugify(nome.value);

  if (internalApps.some((app) => app.id === id)) {
    return { ok: false, error: "Ja existe um aplicativo interno com este nome." };
  }

  const metadados = getOptionalText(formData, "metadados");
  const app = {
    id,
    nome: nome.value,
    categoria: categoria.value,
    descricao: descricao.value,
    versao: getOptionalText(formData, "versao"),
    observacoes: getList(formData, "observacoes"),
    metadados,
    keywords: uniqueValues([...getList(formData, "metadados"), ...tokenize(`${nome.value} ${categoria.value}`)]),
    destaque: false,
    download: {
      nome: nome.value,
      localPath: "",
      downloadUrl: ""
    },
    status: "Em preparacao"
  };

  await writeApps([...internalApps, app]);

  return { ok: true, app };
}

export async function updateInternalAppEditableFieldsFromForm(formData) {
  const id = getRequiredText(formData, "id", "Aplicativo nao informado.");

  if (id.error) {
    return { ok: false, error: id.error };
  }

  const appIndex = internalApps.findIndex((app) => app.id === id.value);

  if (appIndex === -1) {
    return { ok: false, error: "Aplicativo nao encontrado." };
  }

  const nome = getRequiredText(formData, "nome", "Informe o nome do aplicativo.");
  const categoria = getRequiredText(formData, "categoria", "Informe a categoria.");
  const descricao = getRequiredText(formData, "descricao", "Informe a descricao.");

  const validationError = nome.error || categoria.error || descricao.error;

  if (validationError) {
    return { ok: false, error: validationError };
  }

  const metadados = getOptionalText(formData, "metadados");
  const nextApps = internalApps.map((app, index) => {
    if (index !== appIndex) {
      return app;
    }

    return {
      ...app,
      nome: nome.value,
      categoria: categoria.value,
      descricao: descricao.value,
      versao: getOptionalText(formData, "versao"),
      observacoes: getList(formData, "observacoes"),
      metadados,
      keywords: uniqueValues([
        ...(app.keywords || []),
        ...getList(formData, "metadados"),
        ...tokenize(`${nome.value} ${categoria.value} ${metadados}`)
      ])
    };
  });

  await writeApps(nextApps);

  return {
    ok: true,
    app: nextApps[appIndex]
  };
}

async function writeApps(nextApps) {
  const fileContents = `export const internalApps = ${JSON.stringify(nextApps, null, 2)};\n`;
  await fs.writeFile(appDataFilePath, fileContents, "utf8");
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
