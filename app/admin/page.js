import { BookOpen, GraduationCap, Save, ShieldCheck, UploadCloud } from "lucide-react";
import { DynamicListField } from "@/components/admin/DynamicListField";
import { guides as manualGuides } from "@/data/guides";
import { getCurrentAdmin } from "@/lib/auth/server";
import { getInternalApps } from "@/services/appService";
import { getDriverBrands, getDrivers } from "@/services/driverService";
import { getTutorials } from "@/services/tutorialContentService";
import {
  createDriverAction,
  createGuideAction,
  createTutorialAction,
  deleteGuideAction,
  deleteTutorialAction,
  logoutAction,
  updateDriverAction,
  updateGuideAction,
  updateTutorialAction
} from "./actions";
import styles from "./admin.module.css";

export const metadata = {
  title: "Admin",
  description: "Painel interno para cadastro e manutencao segura de drivers, guias e tutoriais."
};

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const admin = await getCurrentAdmin();
  const drivers = getDrivers();
  const brands = getDriverBrands();
  const apps = getInternalApps();
  const tutorials = getTutorials();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <span className={styles.eyebrow}>Area interna</span>
            <h1>Painel administrativo</h1>
          </div>
          <form action={logoutAction}>
            <button className={styles.logout} type="submit">
              Sair
            </button>
          </form>
        </div>
        <p>
          Logado como {admin?.name || admin?.sub}. Drivers e aplicativos sao protegidos contra
          exclusao e troca de arquivo. Guias e tutoriais possuem CRUD completo.
        </p>
      </section>

      <AdminMessages params={params} />

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <span className={styles.eyebrow}>Cadastro inteligente</span>
            <h2>Novo driver</h2>
          </div>
          <strong>{drivers.length} drivers cadastrados</strong>
        </div>

        <form action={createDriverAction} className={styles.formGrid}>
          <label className={styles.field}>
            <span>Marca</span>
            <input name="marca" list="brand-options" placeholder="Bematech, Epson, Elgin, TAKEAT" required />
            <datalist id="brand-options">
              {brands.map((brand) => (
                <option key={brand} value={brand} />
              ))}
              <option value="Control iD" />
              <option value="TAKEAT" />
            </datalist>
          </label>

          <label className={styles.field}>
            <span>Modelo</span>
            <input name="modelo" placeholder="MP-4200 TH, TM-T20X, i9" required />
          </label>

          <label className={styles.field}>
            <span>Categoria</span>
            <select name="categoria" defaultValue="Impressora termica" required>
              <option>Impressora termica</option>
              <option>Impressora fiscal</option>
              <option>Impressora de etiquetas</option>
              <option>Adaptador USB</option>
              <option>Aplicativo interno</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Nome do driver</span>
            <input name="driverName" placeholder="Driver Oficial Windows" required />
          </label>

          <label className={styles.field}>
            <span>Versao</span>
            <input name="versao" placeholder="v1.0, Windows 64 bits, 2026" required />
          </label>

          <label className={styles.field}>
            <span>Arquivo</span>
            <input className={styles.fileInput} name="arquivo" type="file" accept=".zip,.rar,.7z,.exe,.msi" required />
          </label>

          <label className={styles.wideField}>
            <span>Compatibilidade</span>
            <input name="compatibilidade" placeholder="Windows 11, Windows 10 64-bit, Windows Server 2022" />
          </label>

          <label className={styles.wideField}>
            <span>Palavras-chave</span>
            <input name="keywords" placeholder="4200, fiscal, termica, usb, driver" />
          </label>

          <label className={styles.wideField}>
            <span>Guia relacionado</span>
            <input name="guiaTitulo" placeholder="Como instalar Bematech MP-4200 TH" />
          </label>

          <label className={styles.wideField}>
            <span>Descricao</span>
            <textarea name="descricao" placeholder="Descreva o uso do driver e contexto de instalacao." required />
          </label>

          <label className={styles.checkField}>
            <input name="destaque" type="checkbox" />
            Exibir como destaque na Home
          </label>

          <button className={styles.submit} type="submit">
            <UploadCloud size={18} />
            Cadastrar driver
          </button>
        </form>
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <span className={styles.eyebrow}>Protecao de drivers</span>
            <h2>Editar dados permitidos</h2>
          </div>
          <ShieldCheck size={24} />
        </div>
        <p className={styles.sectionNote}>
          Nao ha botao de deletar e nao ha campo para substituir arquivo. O funcionario altera
          somente nome do driver, descricao, keywords, compatibilidade e categoria.
        </p>

        <div className={styles.managementGrid}>
          {drivers.map((driver) => (
            <form className={styles.editableCard} action={updateDriverAction} key={driver.id}>
              <input type="hidden" name="id" value={driver.id} />
              <h3>{driver.marca} {driver.modelo}</h3>
              <small>Arquivo protegido: {driver.driver?.downloadUrl || "sem arquivo"}</small>
              <label>
                Nome do driver
                <input name="driverName" defaultValue={driver.driver?.nome || ""} required />
              </label>
              <label>
                Categoria
                <input name="categoria" defaultValue={driver.categoria} required />
              </label>
              <label>
                Compatibilidade
                <input name="compatibilidade" defaultValue={(driver.compatibilidade || []).join(", ")} />
              </label>
              <label>
                Keywords
                <input name="keywords" defaultValue={(driver.keywords || []).join(", ")} />
              </label>
              <label>
                Descricao
                <textarea name="descricao" defaultValue={driver.descricao} required />
              </label>
              <button className={styles.submit} type="submit">
                <Save size={17} />
                Salvar dados
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <span className={styles.eyebrow}>Aplicativos internos</span>
            <h2>Arquivos protegidos</h2>
          </div>
          <ShieldCheck size={24} />
        </div>
        <div className={styles.lockedList}>
          {apps.map((app) => (
            <article key={app.id}>
              <h3>{app.nome}</h3>
              <p>{app.descricao}</p>
              <small>Arquivo interno protegido: {app.download?.downloadUrl || app.status}</small>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <span className={styles.eyebrow}>Guias</span>
            <h2>Criar guia</h2>
          </div>
          <BookOpen size={24} />
        </div>
        <GuideForm
          action={createGuideAction}
          drivers={drivers}
          apps={apps}
          submitLabel="Criar guia"
        />
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <span className={styles.eyebrow}>Guias</span>
            <h2>Editar e deletar guias manuais</h2>
          </div>
          <strong>{manualGuides.length} guias manuais</strong>
        </div>
        <div className={styles.managementGrid}>
          {manualGuides.map((guide) => (
            <article className={styles.editableCard} key={guide.id}>
              <GuideForm
                action={updateGuideAction}
                drivers={drivers}
                apps={apps}
                guide={guide}
                submitLabel="Atualizar guia"
              />
              <form action={deleteGuideAction} className={styles.miniActions}>
                <input type="hidden" name="id" value={guide.id} />
                <button className={styles.danger} type="submit">
                  Deletar guia
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <span className={styles.eyebrow}>Tutoriais</span>
            <h2>Criar tutorial geral</h2>
          </div>
          <GraduationCap size={24} />
        </div>
        <TutorialForm action={createTutorialAction} submitLabel="Criar tutorial" />
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <span className={styles.eyebrow}>Tutoriais</span>
            <h2>Editar e deletar tutoriais</h2>
          </div>
          <strong>{tutorials.length} tutoriais</strong>
        </div>
        <div className={styles.managementGrid}>
          {tutorials.map((tutorial) => (
            <article className={styles.editableCard} key={tutorial.id}>
              <TutorialForm
                action={updateTutorialAction}
                tutorial={tutorial}
                submitLabel="Atualizar tutorial"
              />
              <form action={deleteTutorialAction} className={styles.miniActions}>
                <input type="hidden" name="id" value={tutorial.id} />
                <button className={styles.danger} type="submit">
                  Deletar tutorial
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminMessages({ params }) {
  const messages = [
    params?.created ? `Driver cadastrado com sucesso: ${params.created}` : "",
    params?.updated ? `Driver atualizado com sucesso: ${params.updated}` : "",
    params?.guideCreated ? `Guia criado com sucesso: ${params.guideCreated}` : "",
    params?.guideUpdated ? `Guia atualizado com sucesso: ${params.guideUpdated}` : "",
    params?.guideDeleted ? `Guia deletado com sucesso: ${params.guideDeleted}` : "",
    params?.tutorialCreated ? `Tutorial criado com sucesso: ${params.tutorialCreated}` : "",
    params?.tutorialUpdated ? `Tutorial atualizado com sucesso: ${params.tutorialUpdated}` : "",
    params?.tutorialDeleted ? `Tutorial deletado com sucesso: ${params.tutorialDeleted}` : ""
  ].filter(Boolean);

  return (
    <>
      {messages.map((message) => (
        <div className={styles.notice} key={message}>{message}</div>
      ))}
      {params?.error ? <div className={styles.error}>{params.error}</div> : null}
    </>
  );
}

function GuideForm({ action, drivers, apps, guide, submitLabel }) {
  return (
    <form action={action} className={styles.formGrid}>
      {guide ? <input type="hidden" name="id" value={guide.id} /> : null}
      <label className={styles.field}>
        <span>Nome do guia</span>
        <input name="titulo" defaultValue={guide?.titulo || ""} required />
      </label>
      <label className={styles.field}>
        <span>Marca</span>
        <input name="marca" defaultValue={guide?.marca || ""} required />
      </label>
      <label className={styles.field}>
        <span>Modelo</span>
        <input name="modelo" defaultValue={guide?.modelo || ""} required />
      </label>
      <label className={styles.field}>
        <span>Categoria</span>
        <input name="categoria" defaultValue={guide?.categoria || "Instalacao"} required />
      </label>
      <label className={styles.field}>
        <span>Driver relacionado</span>
        <select name="driverRelacionadoId" defaultValue={guide?.driverRelacionadoId || ""}>
          <option value="">Nenhum</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.marca} {driver.modelo}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>Aplicativo relacionado</span>
        <select name="aplicativoRelacionadoId" defaultValue={guide?.aplicativoRelacionadoId || ""}>
          <option value="">Nenhum</option>
          {apps.map((app) => (
            <option key={app.id} value={app.id}>
              {app.nome}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.wideField}>
        <span>Descricao</span>
        <textarea name="descricao" defaultValue={guide?.descricao || ""} required />
      </label>
      <label className={styles.wideField}>
        <span>Keywords</span>
        <input name="keywords" defaultValue={(guide?.keywords || []).join(", ")} />
      </label>
      <label className={styles.wideField}>
        <span>Compatibilidade</span>
        <input name="compatibilidade" defaultValue={(guide?.compatibilidade || []).join(", ")} />
      </label>
      <label className={styles.wideField}>
        <span>Observacoes</span>
        <textarea name="observacoes" defaultValue={(guide?.observacoes || []).join("\n")} />
      </label>
      <DynamicListField
        name="passos"
        label="Passo a passo"
        initialItems={guide?.passos || ["Baixe o driver da impressora", "Execute o instalador como administrador"]}
        placeholder="Passo"
        addLabel="Adicionar passo"
      />
      <DynamicListField
        name="errosComuns"
        label="Erros comuns de impressora"
        initialItems={(guide?.errosComuns || []).map((issue) => `${issue.problema} => ${issue.solucao}`)}
        placeholder="Problema => solucao"
        addLabel="Adicionar erro"
      />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        {submitLabel}
      </button>
    </form>
  );
}

function TutorialForm({ action, tutorial, submitLabel }) {
  return (
    <form action={action} className={styles.formGrid}>
      {tutorial ? <input type="hidden" name="id" value={tutorial.id} /> : null}
      <label className={styles.field}>
        <span>Nome</span>
        <input name="titulo" defaultValue={tutorial?.titulo || ""} required />
      </label>
      <label className={styles.field}>
        <span>Categoria</span>
        <input name="categoria" defaultValue={tutorial?.categoria || "Rede"} required />
      </label>
      <label className={styles.wideField}>
        <span>Descricao</span>
        <textarea name="descricao" defaultValue={tutorial?.descricao || ""} required />
      </label>
      <label className={styles.wideField}>
        <span>Keywords</span>
        <input name="keywords" defaultValue={(tutorial?.keywords || tutorial?.tags || []).join(", ")} />
      </label>
      <label className={styles.wideField}>
        <span>Observacoes</span>
        <textarea name="observacoes" defaultValue={(tutorial?.observacoes || []).join("\n")} />
      </label>
      <DynamicListField
        name="passos"
        label="Passo a passo"
        initialItems={tutorial?.passos || ["Pressione Windows + R", "Digite ncpa.cpl", "Configure IPv4"]}
        placeholder="Passo"
        addLabel="Adicionar passo"
      />
      <DynamicListField
        name="errosComuns"
        label="Erros comuns de impressora"
        initialItems={(tutorial?.errosComuns || []).map((issue) => `${issue.problema} => ${issue.solucao}`)}
        placeholder="Problema => solucao"
        addLabel="Adicionar erro"
      />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        {submitLabel}
      </button>
    </form>
  );
}
