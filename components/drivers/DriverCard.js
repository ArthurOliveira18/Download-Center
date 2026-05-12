import Link from "next/link";
import { AlertCircle, BookOpen, CheckCircle2, Download, FolderArchive } from "lucide-react";
import styles from "./DriverCard.module.css";

export function DriverCard({ driver, compact = false }) {
  const downloadUrl = driver.driver?.downloadUrl;
  const fileIsMissing = driver.arquivo?.checked && !driver.arquivo.exists;
  const canDownload = Boolean(downloadUrl) && !fileIsMissing;
  const linkedGuideUrl = driver.guiaVinculado?.url || driver.guiaInstalacao?.url;
  const statusLabel = fileIsMissing ? "Arquivo pendente" : "Arquivo verificado";
  const StatusIcon = fileIsMissing ? AlertCircle : CheckCircle2;

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ""}`}>
      <div className={styles.header}>
        <span className={styles.brand}>{driver.marca}</span>
        <span className={`${styles.status} ${fileIsMissing ? styles.warning : styles.ready}`}>
          <StatusIcon size={15} />
          {statusLabel}
        </span>
      </div>

      <div className={styles.body}>
        <h3>{driver.modelo}</h3>
        <p>{driver.descricao}</p>
      </div>

      <div className={styles.meta}>
        <span>{driver.categoria}</span>
        <span>{driver.driver?.nome}</span>
        {driver.driver?.versao ? <span>{driver.driver.versao}</span> : null}
      </div>

      <div className={styles.actions}>
        {canDownload ? (
          <a className={styles.primaryAction} href={downloadUrl} download>
            <Download size={17} />
            Baixar Driver
          </a>
        ) : (
          <button className={styles.disabledAction} type="button" disabled>
            <FolderArchive size={17} />
            Arquivo pendente
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
