import { TutorialSearchPanel } from "@/components/tutorials/TutorialSearchPanel";
import { getTutorials } from "@/services/tutorialContentService";
import styles from "../sectionPages.module.css";

export const metadata = {
  title: "Tutoriais",
  description: "Tutoriais gerais de rede, USB, Ethernet, IP, drivers e erros comuns de impressora."
};

export default function TutorialsPage() {
  const tutorials = getTutorials();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span>Tutoriais</span>
        <h1>Base de tutoriais</h1>
        <p>
          Conteudos tecnicos gerais para rede, USB, Ethernet, IP, drivers, comunicacao e erros
          comuns de impressora.
        </p>
      </section>

      <section className={styles.surface}>
        <TutorialSearchPanel tutorials={tutorials} />
      </section>
    </div>
  );
}
