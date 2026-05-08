import { internalApps } from "@/data/apps";
import { getPublicFileStatus } from "@/services/fileService";
import { uniqueSorted } from "@/utils/search";

export function getInternalApps() {
  return internalApps
    .map((app) => ({
      ...app,
      arquivo: getPublicFileStatus(app.download?.downloadUrl)
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function getAppCategories() {
  return uniqueSorted(internalApps.map((app) => app.categoria));
}
