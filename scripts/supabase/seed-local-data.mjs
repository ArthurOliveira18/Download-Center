import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const cwd = process.cwd();
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "download-center-files";

loadEnvFile(".env.local");

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar o seed.");
}

if (/\/rest\/v1\/?$/i.test(supabaseUrl)) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL deve ser a URL base do projeto, sem /rest/v1.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const downloads = await readJson("data/json/downloads.json", { drivers: [], apps: [] });
const guides = await readJson("data/json/guides.json", []);
const tutorials = await readJson("data/json/tutorials.json", []);
const guideByOldId = new Map();
const guideByDriverOldId = new Map();
const guideByAppOldId = new Map();

await ensureBucket();

for (const guide of guides) {
  const savedGuide = await upsertGuide({
    titulo: guide.titulo,
    slug: guide.slug || slugify([guide.titulo, guide.marca, guide.modelo].filter(Boolean).join(" ")),
    marca: guide.marca || null,
    modelo: guide.modelo || null,
    categoria: guide.categoria || null,
    descricao: guide.descricao || null,
    conteudo: {
      compatibilidade: asArray(guide.compatibilidade),
      driverRelacionadoId: guide.driverRelacionadoId || "",
      aplicativoRelacionadoId: guide.aplicativoRelacionadoId || ""
    },
    passos: asArray(guide.passos),
    observacoes: asArray(guide.observacoes),
    erros_comuns: asArray(guide.errosComuns),
    keywords: asArray(guide.keywords),
    type: "guia",
    active: true
  });

  guideByOldId.set(guide.id, savedGuide);

  if (guide.driverRelacionadoId) {
    guideByDriverOldId.set(guide.driverRelacionadoId, savedGuide);
  }

  if (guide.aplicativoRelacionadoId) {
    guideByAppOldId.set(guide.aplicativoRelacionadoId, savedGuide);
  }
}

for (const tutorial of tutorials) {
  await upsertGuide({
    titulo: tutorial.titulo,
    slug: tutorial.slug || slugify(tutorial.titulo),
    marca: null,
    modelo: null,
    categoria: tutorial.categoria || null,
    descricao: tutorial.descricao || null,
    conteudo: {},
    passos: asArray(tutorial.passos),
    observacoes: asArray(tutorial.observacoes),
    erros_comuns: asArray(tutorial.errosComuns),
    keywords: asArray(tutorial.keywords),
    type: "tutorial",
    active: true
  });
}

const existingDrivers = await fetchExisting("drivers");
const existingApps = await fetchExisting("internal_apps");

for (const driver of downloads.drivers || []) {
  let linkedGuide = guideByDriverOldId.get(driver.id);

  if (!linkedGuide && driver.guiaInstalacao?.titulo) {
    linkedGuide = await upsertGuide({
      titulo: driver.guiaInstalacao.titulo,
      slug: slugify([driver.guiaInstalacao.titulo, driver.marca, driver.modelo].filter(Boolean).join(" ")),
      marca: driver.marca || null,
      modelo: driver.modelo || null,
      categoria: driver.categoria || null,
      descricao: driver.descricao || null,
      conteudo: {
        compatibilidade: asArray(driver.compatibilidade),
        driverRelacionadoId: driver.id,
        aplicativoRelacionadoId: ""
      },
      passos: asArray(driver.guiaInstalacao.passos),
      observacoes: [],
      erros_comuns: [],
      keywords: asArray(driver.keywords),
      type: "guia",
      active: true
    });
  }

  const upload = await uploadFromPublic(driver.driver?.downloadUrl, "drivers", `${driver.marca}-${driver.modelo}`);
  const payload = {
    marca: driver.marca || null,
    modelo: driver.modelo || null,
    categoria: driver.categoria || null,
    descricao: driver.descricao || null,
    compatibilidade: asArray(driver.compatibilidade),
    keywords: asArray(driver.keywords),
    destaque: Boolean(driver.destaque),
    driver_nome: driver.driver?.nome || "Driver",
    driver_versao: driver.driver?.versao || null,
    download_url: upload.downloadUrl || driver.driver?.downloadUrl || null,
    storage_path: upload.storagePath || null,
    guia_vinculado_id: linkedGuide?.id || null
  };
  const existing = existingDrivers.find((item) => normalize(item.marca) === normalize(payload.marca) && normalize(item.modelo) === normalize(payload.modelo));
  const savedDriver = existing
    ? await updateRow("drivers", existing.id, payload)
    : await insertRow("drivers", payload);

  if (linkedGuide?.id) {
    await updateGuideContent(linkedGuide.id, { driverRelacionadoId: savedDriver.id });
  }
}

for (const app of downloads.apps || []) {
  const linkedGuide = guideByAppOldId.get(app.id);
  const upload = await uploadFromPublic(app.download?.downloadUrl, "apps", app.nome);
  const payload = {
    nome: app.nome || null,
    categoria: app.categoria || null,
    descricao: app.descricao || null,
    versao: app.versao || null,
    download_url: upload.downloadUrl || app.download?.downloadUrl || null,
    storage_path: upload.storagePath || null,
    guia_vinculado_id: linkedGuide?.id || null,
    keywords: asArray(app.keywords),
    active: true
  };
  const existing = existingApps.find((item) => normalize(item.nome) === normalize(payload.nome));
  const savedApp = existing
    ? await updateRow("internal_apps", existing.id, payload)
    : await insertRow("internal_apps", payload);

  if (linkedGuide?.id) {
    await updateGuideContent(linkedGuide.id, { aplicativoRelacionadoId: savedApp.id });
  }
}

console.log("Seed concluido: dados locais enviados para o Supabase.");

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(bucket);

  if (data) {
    return;
  }

  const { error } = await supabase.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit: 1024 * 1024 * 500
  });

  if (error) {
    throw new Error(`Falha ao criar bucket ${bucket}: ${error.message}`);
  }
}

async function upsertGuide(payload) {
  const { data, error } = await supabase
    .from("guides")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Falha ao salvar guia ${payload.slug}: ${error.message}`);
  }

  return data;
}

async function updateGuideContent(id, values) {
  const { data: guide, error: selectError } = await supabase
    .from("guides")
    .select("conteudo")
    .eq("id", id)
    .single();

  if (selectError) {
    throw new Error(selectError.message);
  }

  const { error } = await supabase
    .from("guides")
    .update({ conteudo: { ...(guide.conteudo || {}), ...values } })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

async function fetchExisting(table) {
  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function insertRow(table, payload) {
  const { data, error } = await supabase.from(table).insert(payload).select("*").single();

  if (error) {
    throw new Error(`Falha ao inserir em ${table}: ${error.message}`);
  }

  return data;
}

async function updateRow(table, id, payload) {
  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select("*").single();

  if (error) {
    throw new Error(`Falha ao atualizar ${table}: ${error.message}`);
  }

  return data;
}

async function uploadFromPublic(downloadUrl, folder, prefix) {
  if (!downloadUrl || !downloadUrl.startsWith("/")) {
    return { downloadUrl: downloadUrl || "", storagePath: "" };
  }

  const relativePath = decodeURIComponent(downloadUrl.replace(/^\/+/, ""));
  const absolutePath = path.join(cwd, "public", relativePath);

  try {
    const buffer = await fs.readFile(absolutePath);
    const fileName = sanitizeFileName(`${slugify(prefix)}-${path.basename(relativePath)}`);
    const storagePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, { upsert: true });

    if (error) {
      throw new Error(error.message);
    }

    return {
      downloadUrl: `/api/files/${storagePath.split("/").map(encodeURIComponent).join("/")}`,
      storagePath
    };
  } catch {
    return { downloadUrl, storagePath: "" };
  }
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(path.join(cwd, filePath), "utf8"));
  } catch {
    return fallback;
  }
}

function loadEnvFile(filePath) {
  try {
    const env = readFileSync(path.join(cwd, filePath), "utf8");
    env.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        return;
      }

      const [key, ...valueParts] = trimmed.split("=");
      process.env[key.trim()] ||= valueParts.join("=").trim();
    });
  } catch {
    return;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value = "arquivo") {
  return normalize(value).replace(/\s+/g, "-").replace(/^-+|-+$/g, "") || "arquivo";
}

function sanitizeFileName(fileName = "arquivo.zip") {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "arquivo.zip";
}
