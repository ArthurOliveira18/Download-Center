import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>Download Center TAKEAT</p>
        <p>Estrutura preparada para drivers de impressoras termicas, apps, guias e tutoriais.</p>
      </div>
    </footer>
  );
}
