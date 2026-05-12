import { guides } from "@/data/guides";
import { drivers } from "@/data/drivers";
import { tutorials } from "@/data/tutorials";
import { slugify } from "@/utils/slug";

export function getLinkedGuideOptions() {
  const guideOptions = guides.map((guide) => ({
    type: "guide",
    id: guide.id,
    value: `guide:${guide.id}`,
    label: `Guia: ${guide.titulo}`,
    titulo: guide.titulo,
    url: getManualGuideUrl(guide)
  }));

  const tutorialOptions = tutorials.map((tutorial) => ({
    type: "tutorial",
    id: tutorial.id,
    value: `tutorial:${tutorial.id}`,
    label: `Tutorial: ${tutorial.titulo}`,
    titulo: tutorial.titulo,
    url: `/tutoriais/${tutorial.id}`
  }));

  return [...guideOptions, ...tutorialOptions].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

export function getLinkedGuideValueForResource(resource) {
  const directValue = getLinkedGuideValue(resource?.guiaVinculado);

  if (directValue) {
    return directValue;
  }

  const guideUrl = resource?.guiaInstalacao?.url;

  if (!guideUrl) {
    return "";
  }

  return getLinkedGuideOptions().find((option) => option.url === guideUrl)?.value || "";
}

export function resolveLinkedGuideFromForm(formData) {
  const value = String(formData.get("guiaVinculado") || "").trim();

  if (!value) {
    return { ok: true, guide: null };
  }

  const option = getLinkedGuideOptions().find((item) => item.value === value);

  if (!option) {
    return { ok: false, error: "Guia ou tutorial vinculado nao encontrado." };
  }

  return {
    ok: true,
    guide: {
      type: option.type,
      id: option.id,
      titulo: option.titulo,
      url: option.url
    }
  };
}

export function getLinkedGuideValue(guide) {
  if (!guide?.type || !guide?.id) {
    return "";
  }

  return `${guide.type}:${guide.id}`;
}

function getManualGuideUrl(guide) {
  const relatedDriver = drivers.find((driver) => driver.id === guide.driverRelacionadoId);
  const marcaSlug = slugify(guide.marca || relatedDriver?.marca || "geral");
  const modeloSlug = slugify(guide.modelo || guide.titulo);

  return relatedDriver?.guiaInstalacao?.url || `/guias/${marcaSlug}/${modeloSlug}`;
}
