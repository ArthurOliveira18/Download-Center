import { getTutorialsData } from "@/services/dataRepository";
import { normalizeText, tokenize, uniqueSorted } from "@/utils/search";

export async function getTutorials() {
  return [...(await getTutorialsData())].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
}

export async function getTutorialById(id) {
  return (await getTutorialsData()).find((tutorial) => tutorial.id === id || tutorial.slug === id);
}

export async function getTutorialStaticParams() {
  return (await getTutorialsData()).map((tutorial) => ({ id: tutorial.slug || tutorial.id }));
}

export async function getTutorialCategories() {
  return uniqueSorted((await getTutorialsData()).map((tutorial) => tutorial.categoria));
}

export function searchTutorialsInMemory(records, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return records;
  }

  const tokens = tokenize(query);

  return records
    .map((tutorial) => ({ tutorial, searchText: buildTutorialSearchText(tutorial) }))
    .filter(({ searchText }) => tokens.every((token) => searchText.includes(token)))
    .map(({ tutorial }) => tutorial);
}

function buildTutorialSearchText(tutorial) {
  return [
    tutorial.titulo,
    tutorial.descricao,
    tutorial.categoria,
    ...(tutorial.keywords || []),
    ...(tutorial.observacoes || []),
    ...(tutorial.passos || []),
    ...(tutorial.errosComuns || []).flatMap((issue) => [issue.problema, issue.solucao])
  ]
    .map(normalizeText)
    .join(" ");
}
