"use client";

import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { searchDriversInMemory, uniqueSorted } from "@/utils/search";

export function useDriverSearch(drivers, initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [brand, setBrand] = useState("Todos");
  const [category, setCategory] = useState("Todas");
  const debouncedQuery = useDebouncedValue(query, 180);

  const brands = useMemo(() => uniqueSorted(drivers.map((driver) => driver.marca)), [drivers]);
  const categories = useMemo(() => uniqueSorted(drivers.map((driver) => driver.categoria)), [drivers]);

  const results = useMemo(() => {
    return searchDriversInMemory(drivers, debouncedQuery).filter((driver) => {
      const brandMatches = brand === "Todos" || driver.marca === brand;
      const categoryMatches = category === "Todas" || driver.categoria === category;

      return brandMatches && categoryMatches;
    });
  }, [drivers, debouncedQuery, brand, category]);

  return {
    query,
    setQuery,
    debouncedQuery,
    isSearching: query !== debouncedQuery,
    brand,
    setBrand,
    category,
    setCategory,
    brands,
    categories,
    results
  };
}
