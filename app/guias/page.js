import { GuideSearchPanel } from "@/components/guides/GuideSearchPanel";
import { getGuideRecords } from "@/services/guideContentService";
import styles from "../sectionPages.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Guias de instalacao",
  description: "Guias de instalacao separados por fabricante e modelo."
};

export default async function GuidesPage() {
  const guides = await getGuideRecords();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span>Guias</span>
        <h1>Guias de instalacao</h1>
        <p>
          Passo a passo organizado por fabricante, preparado para receber videos e conteudo mais
          detalhado no futuro.
        </p>
      </section>

      <section className={styles.surface}>
        <GuideSearchPanel guides={guides} />
      </section>
    </div>
  );
}
