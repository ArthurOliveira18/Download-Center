import { getAppsData } from "@/services/dataRepository";
import { getPublicFileStatus } from "@/services/fileService";
import { uniqueSorted } from "@/utils/search";

export async function getInternalApps() {
  return (await getAppsData())
    .map((app) => ({
      ...app,
      arquivo: getPublicFileStatus(app.download?.downloadUrl)
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function getAppCategories() {
  return uniqueSorted((await getAppsData()).map((app) => app.categoria));
}
