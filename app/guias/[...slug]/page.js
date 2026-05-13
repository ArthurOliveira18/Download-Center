import { notFound } from "next/navigation";
import { InstallationGuide } from "@/components/guides/InstallationGuide";
import {
  buildGuideDetail,
  getGuideRecordByParams,
  getGuideRecordBySlug
} from "@/services/guideContentService";
import styles from "../../sectionPages.module.css";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const guide = await getGuideFromParams(await params);

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
  const guideRecord = await getGuideFromParams(await params);

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

async function getGuideFromParams(params) {
  const segments = Array.isArray(params?.slug) ? params.slug : [];

  if (segments.length === 1) {
    return getGuideRecordBySlug(segments[0]);
  }

  if (segments.length >= 2) {
    return getGuideRecordByParams(segments[0], segments[1]);
  }

  return null;
}
