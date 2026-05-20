import { slugify } from "@/utils/slug";

const thermalPrinterCategory = "Impressora termica";

export function mapSupabaseDriverToAppDriver(row = {}) {
  const linkedGuide = mapLinkedGuide(row.guia || row.linked_guide || buildGuideFromViewRow(row));
  const downloadUrl = row.download_url || "";
  const storagePath = row.storage_path || "";
  const fileSizeBytes = Number(row.file_size_bytes || 0);
  const fileType = row.file_type || "";
  const fileName = row.file_name || "";
  const driverVersion = row.driver_versao || "";
  const fallbackGuideUrl = buildLegacyGuideUrl(row.marca, row.modelo);
  const guideInstallUrl = linkedGuide?.type === "guide" ? linkedGuide.url : fallbackGuideUrl;

  return {
    id: row.id,
    marca: row.marca || "",
    modelo: row.modelo || "",
    categoria: row.categoria || thermalPrinterCategory,
    descricao: row.descricao || "",
    compatibilidade: toArray(row.compatibilidade),
    keywords: toArray(row.keywords),
    destaque: Boolean(row.destaque),
    observacoes: toArray(row.observacoes),
    metadados: toArray(row.keywords).join(", "),
    storagePath,
    guiaVinculado: linkedGuide,
    guiaInstalacao: guideInstallUrl
      ? {
          titulo: linkedGuide?.type === "guide" ? linkedGuide.titulo : `Como instalar ${row.marca || ""} ${row.modelo || ""}`.trim(),
          url: guideInstallUrl,
          passos: linkedGuide?.passos?.length ? linkedGuide.passos : getDefaultInstallationSteps()
        }
      : null,
    driver: {
      nome: row.driver_nome || "",
      versao: driverVersion,
      fileName,
      fileSizeBytes,
      fileType,
      localPath: storagePath,
      downloadUrl,
      storagePath,
      versoes: [
        {
          nome: driverVersion || row.driver_nome || "Atual",
          downloadUrl,
          fileName,
          fileSizeBytes,
          fileType,
          localPath: storagePath,
          storagePath
        }
      ]
    }
  };
}

export function mapAppDriverToSupabaseDriver(driver = {}) {
  return {
    marca: driver.marca || null,
    modelo: driver.modelo || null,
    categoria: driver.categoria || thermalPrinterCategory,
    descricao: driver.descricao || null,
    compatibilidade: toArray(driver.compatibilidade),
    keywords: toArray(driver.keywords),
    destaque: Boolean(driver.destaque),
    driver_nome: driver.driver?.nome || driver.driver_nome || null,
    driver_versao: driver.driver?.versao || driver.driver_versao || null,
    download_url: driver.driver?.downloadUrl || driver.download_url || null,
    file_name: driver.driver?.fileName || driver.driver?.originalName || driver.fileName || null,
    file_size_bytes: driver.driver?.fileSizeBytes || driver.fileSizeBytes || null,
    file_type: driver.driver?.fileType || driver.fileType || null,
    storage_path: driver.driver?.storagePath || driver.storagePath || driver.storage_path || null,
    guia_vinculado_id: driver.guiaVinculado?.id || driver.guia_vinculado_id || null
  };
}

export function mapSupabaseInternalAppToAppInternalApp(row = {}) {
  const linkedGuide = mapLinkedGuide(row.guia || row.linked_guide || buildGuideFromViewRow(row));
  const downloadUrl = row.download_url || "";
  const storagePath = row.storage_path || "";
  const fileSizeBytes = Number(row.file_size_bytes || 0);
  const fileType = row.file_type || "";
  const fileName = row.file_name || "";

  return {
    id: row.id,
    nome: row.nome || "",
    categoria: row.categoria || "Aplicativo interno",
    descricao: row.descricao || "",
    versao: row.versao || "",
    keywords: toArray(row.keywords),
    observacoes: toArray(row.observacoes),
    metadados: toArray(row.keywords).join(", "),
    active: row.active !== false,
    destaque: Boolean(row.destaque),
    guiaVinculado: linkedGuide,
    download: {
      nome: row.nome || "Instalador",
      fileName,
      fileSizeBytes,
      fileType,
      localPath: storagePath,
      downloadUrl,
      storagePath
    },
    status: downloadUrl ? "Disponivel" : "Em preparacao",
    storagePath
  };
}

export function mapAppInternalAppToSupabaseInternalApp(app = {}) {
  return {
    nome: app.nome || null,
    categoria: app.categoria || "Aplicativo interno",
    descricao: app.descricao || null,
    versao: app.versao || null,
    download_url: app.download?.downloadUrl || app.download_url || null,
    file_name: app.download?.fileName || app.download?.originalName || app.fileName || null,
    file_size_bytes: app.download?.fileSizeBytes || app.fileSizeBytes || null,
    file_type: app.download?.fileType || app.fileType || null,
    storage_path: app.download?.storagePath || app.storagePath || app.storage_path || null,
    guia_vinculado_id: app.guiaVinculado?.id || app.guia_vinculado_id || null,
    keywords: toArray(app.keywords),
    active: app.active !== false
  };
}

export function mapSupabaseGuideToAppGuide(row = {}) {
  const content = isPlainObject(row.conteudo) ? row.conteudo : {};
  const type = mapDbGuideTypeToAppType(row.type);

  return {
    id: row.id,
    slug: row.slug || buildGuideSlug(row, type),
    titulo: row.titulo || "",
    marca: row.marca || "",
    modelo: row.modelo || "",
    categoria: row.categoria || "",
    descricao: row.descricao || "",
    conteudo: content,
    compatibilidade: toArray(content.compatibilidade),
    driverRelacionadoId: content.driverRelacionadoId || "",
    aplicativoRelacionadoId: content.aplicativoRelacionadoId || "",
    keywords: toArray(row.keywords),
    observacoes: toArray(row.observacoes),
    errosComuns: toIssues(row.erros_comuns),
    passos: toArray(row.passos),
    type,
    active: row.active !== false,
    url: buildGuideUrl(row, type),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

export function mapAppGuideToSupabaseGuide(guide = {}, type = "guide") {
  const appType = type === "tutorial" || guide.type === "tutorial" ? "tutorial" : "guide";
  const content = {
    ...(isPlainObject(guide.conteudo) ? guide.conteudo : {}),
    compatibilidade: toArray(guide.compatibilidade),
    driverRelacionadoId: guide.driverRelacionadoId || "",
    aplicativoRelacionadoId: guide.aplicativoRelacionadoId || ""
  };

  return {
    titulo: guide.titulo || null,
    slug: guide.slug || buildGuideSlug(guide, appType),
    marca: guide.marca || null,
    modelo: guide.modelo || null,
    categoria: guide.categoria || null,
    descricao: guide.descricao || null,
    conteudo: content,
    passos: toArray(guide.passos),
    observacoes: toArray(guide.observacoes),
    erros_comuns: toIssues(guide.errosComuns),
    keywords: toArray(guide.keywords),
    type: mapAppGuideTypeToDbType(appType),
    active: guide.active !== false
  };
}

export function mapLinkedGuide(guide) {
  if (!guide?.id) {
    return null;
  }

  const type = mapDbGuideTypeToAppType(guide.type);

  return {
    type,
    id: guide.id,
    slug: guide.slug || buildGuideSlug(guide, type),
    titulo: guide.titulo || "",
    url: buildGuideUrl(guide, type),
    passos: toArray(guide.passos)
  };
}

export function mapDbGuideTypeToAppType(type = "guia") {
  return type === "tutorial" ? "tutorial" : "guide";
}

export function mapAppGuideTypeToDbType(type = "guide") {
  return type === "tutorial" ? "tutorial" : "guia";
}

export function buildGuideSlug(guide = {}, type = "guide") {
  if (type === "tutorial") {
    return slugify(guide.titulo || "tutorial");
  }

  return slugify([guide.titulo, guide.marca, guide.modelo].filter(Boolean).join(" "));
}

export function buildGuideUrl(guide = {}, type = mapDbGuideTypeToAppType(guide.type)) {
  const slug = guide.slug || buildGuideSlug(guide, type);

  if (type === "tutorial") {
    return `/tutoriais/${slug}`;
  }

  return `/guias/${slug}`;
}

function buildLegacyGuideUrl(marca, modelo) {
  if (!marca || !modelo) {
    return "";
  }

  return `/guias/${slugify(marca)}/${slugify(modelo)}`;
}

function buildGuideFromViewRow(row = {}) {
  if (!row.guia_vinculado_id || !row.guia_titulo) {
    return null;
  }

  return {
    id: row.guia_vinculado_id,
    titulo: row.guia_titulo,
    slug: row.guia_slug,
    type: row.guia_type || "guia"
  };
}

function getDefaultInstallationSteps() {
  return [
    "Baixe o arquivo cadastrado no Download Center.",
    "Extraia o pacote, quando aplicavel.",
    "Execute o instalador como administrador.",
    "Configure a porta USB, serial ou rede.",
    "Finalize com uma impressao de teste."
  ];
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null && String(item).trim() !== "");
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,;]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toIssues(value) {
  return toArray(value).map((item) => {
    if (isPlainObject(item)) {
      return {
        problema: item.problema || item.problem || "Problema nao informado",
        causa: item.causa || item.cause || "",
        solucao: item.solucao || item.fix || item.solution || "Revise a configuracao e tente novamente."
      };
    }

    const [problema, solucao] = String(item).split("=>").map((part) => part.trim());
    return {
      problema: problema || String(item),
      solucao: solucao || "Revise a configuracao e tente novamente."
    };
  });
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
