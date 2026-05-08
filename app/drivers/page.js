import { DriverSearchPanel } from "@/components/drivers/DriverSearchPanel";
import { getDrivers } from "@/services/driverService";
import styles from "../sectionPages.module.css";

export const metadata = {
  title: "Drivers",
  description: "Listagem pesquisavel de drivers de impressoras, adaptadores e utilitarios."
};

export default function DriversPage() {
  const drivers = getDrivers();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span>Drivers</span>
        <h1>Listagem de drivers</h1>
        <p>
          Busca em tempo real por marca, modelo, categoria, descricao, keywords e nome do pacote.
        </p>
      </section>

      <section className={styles.surface}>
        <DriverSearchPanel drivers={drivers} autoFocus />
      </section>
    </div>
  );
}
