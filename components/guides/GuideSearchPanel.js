"use client";

import { useMemo, useState } from "react";
import { GuideCard } from "@/components/guides/GuideCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { normalizeText, tokenize } from "@/utils/search";
import styles from "./GuideSearchPanel.module.css";

export function GuideSearchPanel({ guides }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 180);
  const isSearching = query !== debouncedQuery;
  const results = useMemo(() => searchGuidesInMemory(guides, debouncedQuery), [guides, debouncedQuery]);

  return (
    <section className={styles.panel}>
      <div className={styles.searchRow}>
        <SearchBox
          value={query}
          onChange={setQuery}
          isLoading={isSearching}
          placeholder="Buscar por TAKEAT Printer, Bematech, MP-4200 TH, USB, rede, Epson..."
        />
        <strong>{results.length} guias</strong>
      </div>

      {results.length ? (
        <div className={styles.grid}>
          {results.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      ) : (
        <EmptyState description="Tente buscar por nome, fabricante, modelo, driver, aplicativo, keyword ou descricao." />
      )}
    </section>
  );
}

function searchGuidesInMemory(guides, query) {
  const tokens = tokenize(query);

  if (!tokens.length) {
    return guides;
  }

  return guides.filter((guide) => {
    const searchText = [
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

    return tokens.every((token) => searchText.includes(token));
  });
}
