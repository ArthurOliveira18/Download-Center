import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import styles from "./GuideCard.module.css";

export function GuideCard({ guide }) {
  return (
    <article className={styles.card}>
      <span className={styles.icon}>
        <BookOpen size={20} />
      </span>
      <div>
        <span className={styles.brand}>{guide.marca || guide.categoria}</span>
        <h3>{guide.titulo}</h3>
        <p>{[guide.modelo, guide.categoria].filter(Boolean).join(" - ")}</p>
      </div>
      <Link href={guide.url} className={styles.link}>
        Abrir guia
        <ChevronRight size={17} />
      </Link>
    </article>
  );
}
