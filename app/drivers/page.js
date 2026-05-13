import { DriverSearchPanel } from "@/components/drivers/DriverSearchPanel";
import { getDrivers } from "@/services/driverService";
import styles from "../sectionPages.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Drivers",
  description: "Listagem pesquisavel de drivers de impressoras termicas."
};

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span>Drivers de impressoras termicas</span>
        <h1>Modelos de impressora termica</h1>
        <p>
          Busca em tempo real por marca, modelo, keywords e nome do pacote termico.
        </p>
      </section>

      <section className={styles.surface}>
        <DriverSearchPanel drivers={drivers} autoFocus />
      </section>
    </div>
  );
}
