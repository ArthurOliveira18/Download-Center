import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import styles from "./TutorialArticle.module.css";

export function TutorialArticle({ tutorial }) {
  return (
    <article className={styles.article}>
      <section className={styles.intro}>
        <span>{tutorial.categoria}</span>
        <h2>{tutorial.titulo}</h2>
        <p>{tutorial.descricao}</p>
      </section>

      <section className={styles.block}>
        <div className={styles.blockTitle}>
          <Info size={20} />
          <h3>Observacoes importantes</h3>
        </div>
        <ul className={styles.noteList}>
          {(tutorial.observacoes || []).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <div className={styles.blockTitle}>
          <CheckCircle2 size={20} />
          <h3>Passo a passo</h3>
        </div>
        <ol className={styles.steps}>
          {(tutorial.passos || []).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className={styles.block}>
        <div className={styles.blockTitle}>
          <AlertTriangle size={20} />
          <h3>Erros comuns de impressora</h3>
        </div>
        <div className={styles.issueGrid}>
          {(tutorial.errosComuns || []).map((issue) => (
            <div key={issue.problema}>
              <h4>{issue.problema}</h4>
              <p>{issue.solucao}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
