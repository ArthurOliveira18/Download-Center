import { normalizeText } from "@/utils/search";

export function slugify(value = "arquivo") {
  return (
    normalizeText(value)
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "") || "arquivo"
  );
}

export function sanitizeFileName(fileName = "driver.zip") {
  const cleaned = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "driver.zip";
}
