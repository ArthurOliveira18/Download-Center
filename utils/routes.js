export function guideParamsFromUrl(url = "") {
  const parts = url.split("/").filter(Boolean);
  const guideIndex = parts.indexOf("guias");

  if (guideIndex === -1) {
    return null;
  }

  const marca = parts[guideIndex + 1];
  const modelo = parts[guideIndex + 2];

  if (!marca || !modelo) {
    return null;
  }

  return { marca, modelo };
}
