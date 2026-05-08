"use client";

import { useMemo, useState } from "react";
import { TutorialCard } from "@/components/tutorials/TutorialCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { normalizeText, tokenize } from "@/utils/search";
import styles from "./TutorialSearchPanel.module.css";

export function TutorialSearchPanel({ tutorials }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 180);
  const isSearching = query !== debouncedQuery;
  const results = useMemo(() => searchTutorials(tutorials, debouncedQuery), [tutorials, debouncedQuery]);

  return (
    <section className={styles.panel}>
      <div className={styles.searchRow}>
        <SearchBox
          value={query}
          onChange={setQuery}
          isLoading={isSearching}
          placeholder="Buscar por USB, rede, Ethernet, IP, impressora, driver, erros..."
        />
        <strong>{results.length} tutoriais</strong>
      </div>

      {results.length ? (
        <div className={styles.grid}>
          {results.map((tutorial) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} />
          ))}
        </div>
      ) : (
        <EmptyState description="Tente buscar por nome, descricao, categoria, keyword ou passo do tutorial." />
      )}
    </section>
  );
}

function searchTutorials(tutorials, query) {
  const tokens = tokenize(query);

  if (!tokens.length) {
    return tutorials;
  }

  return tutorials.filter((tutorial) => {
    const searchText = [
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

    return tokens.every((token) => searchText.includes(token));
  });
}
