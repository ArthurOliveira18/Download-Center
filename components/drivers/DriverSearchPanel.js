"use client";

import { DriverCard } from "@/components/drivers/DriverCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import { SkeletonGrid } from "@/components/ui/SkeletonGrid";
import { useDriverSearch } from "@/hooks/useDriverSearch";
import styles from "./DriverSearchPanel.module.css";

export function DriverSearchPanel({
  drivers,
  title = "Encontre o driver certo",
  description = "Pesquise por marca, modelo, categoria, palavra-chave ou nome do driver.",
  placeholder = "Buscar por Bematech, 4200, driver Epson, impressora fiscal...",
  showFilters = true,
  limitWhenIdle,
  autoFocus = false
}) {
  const {
    query,
    setQuery,
    debouncedQuery,
    isSearching,
    brand,
    setBrand,
    category,
    setCategory,
    brands,
    categories,
    results
  } = useDriverSearch(drivers);

  const hasActiveSearch = Boolean(debouncedQuery || brand !== "Todos" || category !== "Todas");
  const visibleResults = !hasActiveSearch && limitWhenIdle ? results.slice(0, limitWhenIdle) : results;

  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Busca inteligente</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <strong>{results.length} itens</strong>
      </div>

      <SearchBox
        value={query}
        onChange={setQuery}
        isLoading={isSearching}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />

      {showFilters ? (
        <div className={styles.filters}>
          <label>
            <span>Marca</span>
            <select value={brand} onChange={(event) => setBrand(event.target.value)}>
              <option>Todos</option>
              {brands.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Categoria</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>Todas</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {isSearching ? <SkeletonGrid count={limitWhenIdle || 4} /> : null}

      {!isSearching && visibleResults.length > 0 ? (
        <div className={styles.grid}>
          {visibleResults.map((driver) => (
            <DriverCard key={driver.id} driver={driver} compact={Boolean(limitWhenIdle)} />
          ))}
        </div>
      ) : null}

      {!isSearching && visibleResults.length === 0 ? (
        <EmptyState
          description="Tente buscar por marca, modelo, categoria, termo parcial ou palavra-chave cadastrada no array."
        />
      ) : null}
    </section>
  );
}
