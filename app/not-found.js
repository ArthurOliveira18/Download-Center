import Link from "next/link";
import styles from "./sectionPages.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span>404</span>
        <h1>Pagina nao encontrada</h1>
        <p>O recurso solicitado nao existe ou ainda nao foi cadastrado.</p>
        <Link className={styles.download} href="/drivers">
          Voltar para drivers
        </Link>
      </section>
    </div>
  );
}
