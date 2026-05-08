import { Cable, Printer, Wrench } from "lucide-react";
import styles from "./CategoryCards.module.css";

const icons = {
  "Impressora termica": Printer,
  "Adaptador USB": Cable
};

export function CategoryCards({ categories, drivers }) {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <span>Categorias</span>
        <h2>Navegacao por tipo de recurso</h2>
      </div>

      <div className={styles.grid}>
        {categories.map((category) => {
          const Icon = icons[category] || Wrench;
          const total = drivers.filter((driver) => driver.categoria === category).length;

          return (
            <article className={styles.card} key={category}>
              <Icon size={24} />
              <h3>{category}</h3>
              <p>{total} {total === 1 ? "item" : "itens"}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
