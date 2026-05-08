import { notFound } from "next/navigation";
import { InstallationGuide } from "@/components/guides/InstallationGuide";
import {
  buildGuideDetail,
  getGuideRecordByParams,
  getGuideStaticParams
} from "@/services/guideContentService";
import styles from "../../../sectionPages.module.css";

export function generateStaticParams() {
  return getGuideStaticParams();
}

export async function generateMetadata({ params }) {
  const { marca, modelo } = await params;
  const guide = getGuideRecordByParams(marca, modelo);

  if (!guide) {
    return {
      title: "Guia"
    };
  }

  return {
    title: guide.titulo,
    description: guide.descricao
  };
}

export default async function GuideDetailPage({ params }) {
  const { marca, modelo } = await params;
  const guideRecord = getGuideRecordByParams(marca, modelo);

  if (!guideRecord) {
    notFound();
  }

  const guide = buildGuideDetail(guideRecord);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span>{guideRecord.marca || guideRecord.categoria}</span>
        <h1>{guideRecord.titulo}</h1>
        <p>{guideRecord.descricao}</p>
      </section>

      <InstallationGuide guide={guide} />
    </div>
  );
}
