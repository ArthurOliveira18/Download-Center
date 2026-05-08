import { SearchX } from "lucide-react";
import styles from "./EmptyState.module.css";

export function EmptyState({ title = "Nenhum resultado encontrado", description }) {
  return (
    <div className={styles.empty}>
      <SearchX size={28} />
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
