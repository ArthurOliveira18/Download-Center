"use client";

import { LoaderCircle, Search, X } from "lucide-react";
import styles from "./SearchBox.module.css";

export function SearchBox({ value, onChange, placeholder, isLoading = false, autoFocus = false }) {
  return (
    <div className={styles.searchBox}>
      <Search className={styles.icon} size={20} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />
      {isLoading ? <LoaderCircle className={styles.loader} size={18} /> : null}
      {value ? (
        <button
          type="button"
          title="Limpar busca"
          aria-label="Limpar busca"
          className={styles.clearButton}
          onClick={() => onChange("")}
        >
          <X size={17} />
        </button>
      ) : null}
    </div>
  );
}
