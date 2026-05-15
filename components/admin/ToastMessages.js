"use client";

import { useEffect, useState } from "react";
import styles from "./ToastMessages.module.css";

export function ToastMessages({ error = "", messages = [] }) {
  const [visibleMessages, setVisibleMessages] = useState(messages);
  const [visibleError, setVisibleError] = useState(error);

  useEffect(() => {
    setVisibleMessages(messages);
    setVisibleError(error);

    const timer = window.setTimeout(() => {
      setVisibleMessages([]);
      setVisibleError("");
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [messages, error]);

  if (!visibleMessages.length && !visibleError) {
    return null;
  }

  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {visibleMessages.map((message, index) => (
        <div className={styles.toast} key={`${message}-${index}`}>
          {message}
        </div>
      ))}
      {visibleError ? <div className={styles.error}>{visibleError}</div> : null}
    </div>
  );
}
