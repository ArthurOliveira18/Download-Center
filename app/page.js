import Link from "next/link";
import { ArrowRight, BookOpen, DownloadCloud, PackageOpen } from "lucide-react";
import { DriverSearchPanel } from "@/components/drivers/DriverSearchPanel";
import { CategoryCards } from "@/components/home/CategoryCards";
import { getDriverCategories, getDrivers, getFeaturedDrivers } from "@/services/driverService";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const drivers = await getDrivers();
  const featuredDrivers = await getFeaturedDrivers();
  const categories = await getDriverCategories();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Drivers de impressoras termicas</span>
          <h1>Download Center TAKEAT</h1>
          <p>
            Pesquise drivers para impressoras termicas, guias, aplicativos internos e tutoriais
            com uma estrutura simples de manter e pronta para crescer.
          </p>

          <div className={styles.heroActions}>
            <Link href="/drivers">
              <DownloadCloud size={18} />
              Ver drivers
            </Link>
            <Link href="/guias">
              <BookOpen size={18} />
              Guias
            </Link>
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.panelTop}>
            <strong>{drivers.length}</strong>
            <span>drivers cadastrados</span>
          </div>
          <div className={styles.panelLine} />
          <div className={styles.panelRows}>
            {featuredDrivers.slice(0, 3).map((driver) => (
              <div key={driver.id}>
                <span>{driver.marca}</span>
                <strong>{driver.modelo}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.searchSection}>
        <DriverSearchPanel drivers={drivers} limitWhenIdle={4} showFilters={false} autoFocus />
      </section>

      <CategoryCards categories={categories} drivers={drivers} />

      <section className={styles.quickLinks}>
        <Link href="/apps">
          <PackageOpen size={22} />
          <span>
            <strong>Aplicativos internos</strong>
            <small>TAKEAT Printer, Hercules entre outros</small>
          </span>
          <ArrowRight size={18} />
        </Link>
        <Link href="/tutoriais">
          <BookOpen size={22} />
          <span>
            <strong>Tutoriais</strong>
            <small>Instalacao, rede e troubleshooting</small>
          </span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
