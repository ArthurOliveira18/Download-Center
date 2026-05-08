import { AlertTriangle, CheckCircle2, Download, ImageIcon, Info, PlaySquare, Wrench } from "lucide-react";
import styles from "./InstallationGuide.module.css";

const toneIcons = {
  default: Wrench,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle
};

export function InstallationGuide({ guide }) {
  return (
    <article className={styles.guide}>
      <section className={styles.summary}>
        <div>
          <span>Guia automatico</span>
          <h2>{guide.modelName}</h2>
          <p>{guide.summary}</p>
        </div>
        {guide.download.url ? (
          <a href={guide.download.url} download>
            <Download size={18} />
            Baixar driver
          </a>
        ) : null}
      </section>

      <section className={styles.infoGrid}>
        <div>
          <h3>Compatibilidade</h3>
          <ul>
            {guide.compatibility.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Pre-requisitos</h3>
          <ul>
            {guide.prerequisites.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.notices}>
        <div className={styles.sectionTitle}>
          <span>Avisos importantes</span>
          <h3>Antes de continuar</h3>
        </div>
        <ul>
          {guide.notices.map((notice) => (
            <li key={notice}>
              <AlertTriangle size={17} />
              <span>{notice}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.timeline}>
        {guide.sections.map((section) => {
          const Icon = toneIcons[section.tone] || Wrench;

          return (
            <div className={`${styles.section} ${styles[section.tone] || ""}`} key={section.id}>
              <div className={styles.sectionHeader}>
                <span>
                  <Icon size={20} />
                </span>
                <h3>{section.title}</h3>
              </div>
              <ol>
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>

      <section className={styles.troubleshooting}>
        <div className={styles.sectionTitle}>
          <span>Solucoes</span>
          <h3>Erros comuns e como corrigir</h3>
        </div>
        <div className={styles.issueGrid}>
          {guide.troubleshooting.map((issue) => (
            <div className={styles.issue} key={issue.problem}>
              <h4>{issue.problem}</h4>
              <p><strong>Causa provavel:</strong> {issue.cause}</p>
              <p><strong>Correcao:</strong> {issue.fix}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.media}>
        <div className={styles.sectionTitle}>
          <span>Midia futura</span>
          <h3>Espacos preparados para imagens e videos</h3>
        </div>
        <div className={styles.mediaGrid}>
          {guide.mediaSlots.map((slot) => {
            const Icon = slot.type === "video" ? PlaySquare : ImageIcon;

            return (
              <div key={slot.title}>
                <Icon size={22} />
                <h4>{slot.title}</h4>
                <p>{slot.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.references}>
        <div className={styles.sectionTitle}>
          <span>Pesquisa</span>
          <h3>Fontes tecnicas consultadas</h3>
        </div>
        <ul>
          {guide.references.map((reference) => (
            <li key={reference.url}>
              <a href={reference.url} target={reference.url.startsWith("http") ? "_blank" : undefined}>
                {reference.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
