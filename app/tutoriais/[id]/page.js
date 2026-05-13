import { notFound } from "next/navigation";
import { TutorialArticle } from "@/components/tutorials/TutorialArticle";
import {
  getTutorialById
} from "@/services/tutorialContentService";
import styles from "../../sectionPages.module.css";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const tutorial = await getTutorialById(id);

  if (!tutorial) {
    return {
      title: "Tutorial"
    };
  }

  return {
    title: tutorial.titulo,
    description: tutorial.descricao
  };
}

export default async function TutorialDetailPage({ params }) {
  const { id } = await params;
  const tutorial = await getTutorialById(id);

  if (!tutorial) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span>{tutorial.categoria}</span>
        <h1>{tutorial.titulo}</h1>
        <p>{tutorial.descricao}</p>
      </section>

      <TutorialArticle tutorial={tutorial} />
    </div>
  );
}
