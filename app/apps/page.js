import { AppCard } from "@/components/apps/AppCard";
import { getInternalApps } from "@/services/appService";
import styles from "../sectionPages.module.css";

export const metadata = {
  title: "Aplicativos internos",
  description: "Aplicativos internos e utilitarios da empresa."
};

export default function AppsPage() {
  const apps = getInternalApps();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span>Apps internos</span>
        <h1>Aplicativos e utilitarios</h1>
        <p>
          Area preparada para TAKEAT Printer, Hercules e utilitarios de fabricantes usados pelo
          suporte.
        </p>
      </section>

      <section className={styles.stack}>
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </section>
    </div>
  );
}
