import Link from "next/link";
import { BookOpen, Download, PackageOpen } from "lucide-react";
import styles from "./AppCard.module.css";

export function AppCard({ app }) {
  const downloadUrl = app.download?.downloadUrl;
  const fileIsMissing = app.arquivo?.checked && !app.arquivo.exists;
  const canDownload = Boolean(downloadUrl) && !fileIsMissing;
  const linkedGuideUrl = app.guiaVinculado?.url;

  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        <PackageOpen size={22} />
      </div>
      <div className={styles.content}>
        <span>{app.categoria}</span>
        <h3>{app.nome}</h3>
        <p>{app.descricao}</p>
      </div>
      <div className={styles.actions}>
        {canDownload ? (
          <a className={styles.action} href={downloadUrl} download>
            <Download size={17} />
            Baixar
          </a>
        ) : (
          <button className={styles.disabled} type="button" disabled>
            {app.status || "Pendente"}
          </button>
        )}

        {linkedGuideUrl ? (
          <Link className={styles.secondaryAction} href={linkedGuideUrl}>
            <BookOpen size={17} />
            Ver guia de instalacao
          </Link>
        ) : null}
      </div>
    </article>
  );
}
