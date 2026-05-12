"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import styles from "./MultiDeleteForm.module.css";

export function MultiDeleteForm({ action, cancelHref, emptyMessage, items, noun }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const selectedCount = selectedIds.length;
  const countLabel = useMemo(() => {
    if (!selectedCount) {
      return "Nenhum item selecionado.";
    }

    return `${selectedCount} ${selectedCount === 1 ? "item sera excluido" : "itens serao excluidos"}.`;
  }, [selectedCount]);

  function toggleItem(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  }

  return (
    <form action={action} className={styles.form}>
      <div className={styles.summary}>
        <strong>Confirme a exclusao</strong>
        <span>{countLabel} Esta acao nao pode ser desfeita.</span>
      </div>

      {items.length ? (
        <div className={styles.list}>
          {items.map((item) => {
            const checked = selectedIds.includes(item.id);

            return (
              <label className={`${styles.item} ${checked ? styles.selected : ""}`} key={item.id}>
                <input
                  checked={checked}
                  name="ids"
                  onChange={() => toggleItem(item.id)}
                  type="checkbox"
                  value={item.id}
                />
                <span>
                  <strong>{item.title}</strong>
                  {item.description ? <small>{item.description}</small> : null}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <p className={styles.empty}>{emptyMessage || `Nenhum ${noun} disponivel para excluir.`}</p>
      )}

      {!selectedCount && items.length ? (
        <p className={styles.hint}>Selecione pelo menos um item para liberar o botao de exclusao.</p>
      ) : null}

      <div className={styles.actions}>
        <Link className={styles.cancel} href={cancelHref}>
          Cancelar
        </Link>
        <button className={styles.danger} disabled={!selectedCount} type="submit">
          <Trash2 size={17} />
          Excluir selecionados
        </button>
      </div>
    </form>
  );
}
