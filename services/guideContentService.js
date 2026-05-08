import { guides } from "@/data/guides";
import { internalApps } from "@/data/apps";
import { drivers } from "@/data/drivers";
import { getDrivers } from "@/services/driverService";
import { buildInstallationGuide } from "@/services/guideService";
import { guideParamsFromUrl } from "@/utils/routes";
import { normalizeText, tokenize, uniqueSorted } from "@/utils/search";
import { slugify } from "@/utils/slug";

export function getGuideRecords() {
  const manualGuides = guides.map(normalizeManualGuide);
  const manualUrls = new Set(manualGuides.map((guide) => guide.url));
  const generatedGuides = getDrivers()
    .filter((driver) => driver.guiaInstalacao?.url && !manualUrls.has(driver.guiaInstalacao.url))
    .map((driver) => normalizeGeneratedGuide(driver));

  return [...manualGuides, ...generatedGuides].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
}

export function getGuideRecordByParams(marca, modelo) {
  const targetUrl = `/guias/${marca}/${modelo}`;

  return getGuideRecords().find((guide) => guide.url === targetUrl);
}

export function getGuideStaticParams() {
  return getGuideRecords()
    .map((guide) => guideParamsFromUrl(guide.url))
    .filter(Boolean);
}

export function getGuideCategories() {
  return uniqueSorted(getGuideRecords().map((guide) => guide.categoria));
}

export function searchGuidesInMemory(records, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return records;
  }

  const tokens = tokenize(query);

  return records
    .map((guide) => ({ guide, searchText: buildGuideSearchText(guide) }))
    .filter(({ searchText }) => tokens.every((token) => searchText.includes(token)))
    .map(({ guide }) => guide);
}

export function buildGuideDetail(guide) {
  if (guide.source === "generated" && guide.driver) {
    return buildInstallationGuide(guide.driver);
  }

  return {
    title: guide.titulo,
    modelName: `${guide.marca} ${guide.modelo}`.trim() || guide.titulo,
    summary: guide.descricao,
    compatibility: guide.compatibilidade?.length ? guide.compatibilidade : ["Windows 11", "Windows 10"],
    prerequisites: [
      "Permissao de administrador quando houver instalador.",
      "Arquivo, driver ou aplicativo relacionado disponivel.",
      "Equipamento ligado e cabos conferidos.",
      "Acesso ao painel de impressoras e rede do Windows."
    ],
    download: {
      label: guide.driverRelacionadoNome || guide.aplicativoRelacionadoNome || "Recurso relacionado",
      version: "",
      url: guide.driverDownloadUrl || guide.appDownloadUrl || ""
    },
    notices: guide.observacoes?.length
      ? guide.observacoes
      : ["Revise os dados do equipamento antes de iniciar o procedimento."],
    sections: [
      {
        id: "passo-a-passo",
        title: "Passo a passo",
        tone: "default",
        steps: guide.passos?.length ? guide.passos : ["Cadastre os passos deste guia no painel administrativo."]
      }
    ],
    troubleshooting: (guide.errosComuns || []).map((issue) => ({
      problem: issue.problema,
      cause: issue.causa || "Falha comum de configuracao, comunicacao ou driver.",
      fix: issue.solucao
    })),
    mediaSlots: [
      {
        type: "image",
        title: "Imagem do procedimento",
        description: "Espaco preparado para print ou foto do guia."
      },
      {
        type: "video",
        title: "Video do procedimento",
        description: "Espaco preparado para tutorial em video."
      }
    ],
    references: []
  };
}

function normalizeManualGuide(guide) {
  const driver = drivers.find((item) => item.id === guide.driverRelacionadoId);
  const app = internalApps.find((item) => item.id === guide.aplicativoRelacionadoId);
  const marcaSlug = slugify(guide.marca || driver?.marca || "geral");
  const modeloSlug = slugify(guide.modelo || guide.titulo);
  const url = driver?.guiaInstalacao?.url || `/guias/${marcaSlug}/${modeloSlug}`;

  return {
    ...guide,
    source: "manual",
    url,
    driverRelacionadoNome: driver ? `${driver.marca} ${driver.modelo}` : "",
    driverDownloadUrl: driver?.driver?.downloadUrl || "",
    aplicativoRelacionadoNome: app?.nome || "",
    appDownloadUrl: app?.download?.downloadUrl || ""
  };
}

function normalizeGeneratedGuide(driver) {
  return {
    id: `auto-${driver.id}`,
    source: "generated",
    titulo: driver.guiaInstalacao.titulo,
    marca: driver.marca,
    modelo: driver.modelo,
    categoria: driver.categoria,
    driverRelacionadoId: driver.id,
    driverRelacionadoNome: `${driver.marca} ${driver.modelo}`,
    aplicativoRelacionadoId: "",
    aplicativoRelacionadoNome: "",
    descricao: driver.descricao,
    keywords: driver.keywords || [],
    compatibilidade: driver.compatibilidade || [],
    observacoes: [],
    errosComuns: [],
    passos: driver.guiaInstalacao.passos || [],
    url: driver.guiaInstalacao.url,
    driver
  };
}

function buildGuideSearchText(guide) {
  return [
    guide.titulo,
    guide.marca,
    guide.modelo,
    guide.categoria,
    guide.driverRelacionadoNome,
    guide.aplicativoRelacionadoNome,
    guide.descricao,
    ...(guide.keywords || []),
    ...(guide.compatibilidade || []),
    ...(guide.passos || [])
  ]
    .map(normalizeText)
    .join(" ");
}
