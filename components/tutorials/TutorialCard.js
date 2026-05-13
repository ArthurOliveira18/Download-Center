import Link from "next/link";
import { CheckCircle2, ChevronRight, GraduationCap } from "lucide-react";
import styles from "./TutorialCard.module.css";

export function TutorialCard({ tutorial }) {
  const steps = tutorial.passos || tutorial.etapas || [];

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>
          <GraduationCap size={20} />
        </span>
        <span className={styles.category}>{tutorial.categoria}</span>
      </div>
      <h3>{tutorial.titulo}</h3>
      <p>{tutorial.descricao}</p>
      <ul>
        {steps.slice(0, 4).map((step) => (
          <li key={step}>
            <CheckCircle2 size={16} />
            <span>{step}</span>
          </li>
        ))}
      </ul>
      <Link className={styles.link} href={tutorial.url || `/tutoriais/${tutorial.slug || tutorial.id}`}>
        Abrir tutorial
        <ChevronRight size={17} />
      </Link>
    </article>
  );
}
