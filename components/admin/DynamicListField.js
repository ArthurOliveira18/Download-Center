"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import styles from "./DynamicListField.module.css";

export function DynamicListField({
  name,
  label,
  initialItems = [""],
  placeholder = "Digite o passo",
  addLabel = "Adicionar passo"
}) {
  const [items, setItems] = useState(initialItems.length ? initialItems : [""]);

  function updateItem(index, value) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function addItem() {
    setItems((current) => [...current, ""]);
  }

  function removeItem(index) {
    setItems((current) => (current.length === 1 ? [""] : current.filter((_, itemIndex) => itemIndex !== index)));
  }

  function moveItem(index, direction) {
    setItems((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const item = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = item;
      return next;
    });
  }

  return (
    <div className={styles.field}>
      <div className={styles.header}>
        <span>{label}</span>
        <button type="button" onClick={addItem}>
          <Plus size={16} />
          {addLabel}
        </button>
      </div>

      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={`${name}-${index}`}>
            <input
              name={name}
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={`${placeholder} ${index + 1}`}
            />
            <div className={styles.actions}>
              <button type="button" title="Mover para cima" onClick={() => moveItem(index, -1)}>
                <ArrowUp size={15} />
              </button>
              <button type="button" title="Mover para baixo" onClick={() => moveItem(index, 1)}>
                <ArrowDown size={15} />
              </button>
              <button type="button" title="Remover" onClick={() => removeItem(index)}>
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
