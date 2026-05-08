import { tutorials } from "@/data/tutorials";
import { normalizeText, tokenize, uniqueSorted } from "@/utils/search";

export function getTutorials() {
  return [...tutorials].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
}

export function getTutorialById(id) {
  return tutorials.find((tutorial) => tutorial.id === id);
}

export function getTutorialStaticParams() {
  return tutorials.map((tutorial) => ({ id: tutorial.id }));
}

export function getTutorialCategories() {
  return uniqueSorted(tutorials.map((tutorial) => tutorial.categoria));
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
