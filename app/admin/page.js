import Link from "next/link";
import {
  ArrowLeft,
  AppWindow,
  BookOpen,
  ClipboardCheck,
  DownloadCloud,
  Eye,
  FilePlus2,
  GraduationCap,
  ListChecks,
  Pencil,
  PlusCircle,
  Save,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { DynamicListField } from "@/components/admin/DynamicListField";
import { guides as manualGuides } from "@/data/guides";
import { getCurrentAdmin } from "@/lib/auth/server";
import { getInternalApps } from "@/services/appService";
import { getDrivers } from "@/services/driverService";
import { getTutorials } from "@/services/tutorialContentService";
import {
  createDriverAction,
  createGuideAction,
  createInternalAppAction,
  createTutorialAction,
  deleteGuideAction,
  deleteTutorialAction,
  logoutAction,
  updateDriverAction,
  updateGuideAction,
  updateInternalAppAction,
  updateTutorialAction
} from "./actions";
import styles from "./admin.module.css";

const adminAreas = {
  drivers: {
    title: "Gerenciar Drivers",
    shortTitle: "Drivers",
    description: "Adicione drivers e edite somente informacoes basicas. Arquivos existentes ficam protegidos.",
    icon: DownloadCloud
  },
  apps: {
    title: "Gerenciar Aplicativos Internos",
    shortTitle: "Aplicativos internos",
    description: "Organize aplicativos internos sem apagar ou substituir instaladores ja cadastrados.",
    icon: AppWindow
  },
  guides: {
    title: "Gerenciar Guias",
    shortTitle: "Guias",
    description: "Crie, edite, revise e exclua guias de instalacao.",
    icon: BookOpen
  },
  tutorials: {
    title: "Gerenciar Tutoriais",
    shortTitle: "Tutoriais",
    description: "Crie, edite, revise e exclua tutoriais gerais.",
    icon: GraduationCap
  }
};

export const metadata = {
  title: "Admin",
  description: "Painel interno para manutencao segura de drivers, aplicativos, guias e tutoriais."
};

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const admin = await getCurrentAdmin();
  const drivers = getDrivers();
  const apps = getInternalApps();
  const tutorials = getTutorials();
  const area = normalizeArea(getParam(params, "area"));
  const action = normalizeAction(getParam(params, "action"));
  const itemId = getParam(params, "item");

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
          Logado como {admin?.name || admin?.sub}. Escolha uma area, selecione um item e execute
          apenas as acoes permitidas para aquele tipo de conteudo.
        </p>
      </section>

      <AdminMessages params={params} />

      {!area ? (
        <AdminAreaHome drivers={drivers} apps={apps} guides={manualGuides} tutorials={tutorials} />
      ) : null}

      {area === "drivers" ? <DriversArea action={action} drivers={drivers} selectedId={itemId} /> : null}
      {area === "apps" ? <AppsArea action={action} apps={apps} selectedId={itemId} /> : null}
      {area === "guides" ? <GuidesArea action={action} apps={apps} drivers={drivers} selectedId={itemId} /> : null}
      {area === "tutorials" ? <TutorialsArea action={action} selectedId={itemId} tutorials={tutorials} /> : null}
    </div>
  );
}

function AdminAreaHome({ drivers, apps, guides, tutorials }) {
  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <div>
          <span className={styles.eyebrow}>Escolha a area</span>
          <h2>O que voce deseja gerenciar?</h2>
        </div>
        <ShieldCheck size={24} />
      </div>

      <div className={styles.categoryGrid}>
        <AreaCard area="drivers" count={`${drivers.length} drivers`} />
        <AreaCard area="apps" count={`${apps.length} aplicativos`} />
        <AreaCard area="guides" count={`${guides.length} guias`} />
        <AreaCard area="tutorials" count={`${tutorials.length} tutoriais`} />
      </div>
    </section>
  );
}

function AreaCard({ area, count }) {
  const areaData = adminAreas[area];
  const Icon = areaData.icon;

  return (
    <Link className={styles.categoryCard} href={`/admin?area=${area}`}>
      <span className={styles.categoryIcon}>
        <Icon size={22} />
      </span>
      <span>
        <strong>{areaData.title}</strong>
        <small>{count}</small>
      </span>
      <p>{areaData.description}</p>
    </Link>
  );
}

function AreaHeader({ area }) {
  const areaData = adminAreas[area];

  return (
    <section className={styles.areaHeader}>
      <Link className={styles.backLink} href="/admin">
        <ArrowLeft size={17} />
        Voltar
      </Link>
      <div>
        <span className={styles.eyebrow}>Area selecionada</span>
        <h2>{areaData.title}</h2>
        <p>{areaData.description}</p>
      </div>
    </section>
  );
}

function DriversArea({ action, drivers, selectedId }) {
  const selectedDriver = drivers.find((driver) => driver.id === selectedId);

  return (
    <>
      <AreaHeader area="drivers" />

      <section className={styles.panel}>
        <AreaToolbar
          count={`${drivers.length} itens`}
          eyebrow="Drivers cadastrados"
          title="Escolha como deseja gerenciar os drivers"
        />
        <p className={styles.sectionNote}>
          Drivers nao podem ser excluidos. Na edicao, o arquivo real nao aparece como campo e nao pode ser trocado.
        </p>
        <ActionCards
          actions={[
            { href: "/admin?area=drivers&action=create", icon: PlusCircle, label: "Adicionar driver" },
            { href: "/admin?area=drivers&action=edit", icon: Pencil, label: "Editar driver" },
            { href: "/admin?area=drivers&action=review", icon: Eye, label: "Revisar driver", secondary: true }
          ]}
        />
        <ResourceGrid
          items={drivers.map((driver) => ({
            id: driver.id,
            title: `${driver.marca} ${driver.modelo}`,
            eyebrow: driver.categoria,
            description: driver.descricao,
            meta: [driver.driver?.nome, driver.driver?.versao].filter(Boolean)
          }))}
        />
      </section>

      {action === "create" ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Novo driver" icon={FilePlus2} title="Adicionar driver" />
          <DriverCreateForm />
        </section>
      ) : null}

      {action === "edit" && !selectedDriver ? (
        <SelectItemPanel
          action="edit"
          area="drivers"
          items={drivers.map((driver) => ({
            id: driver.id,
            label: `${driver.marca} ${driver.modelo} - ${driver.driver?.nome || "Driver"}`
          }))}
          title="Qual driver deseja editar?"
        />
      ) : null}

      {action === "review" && !selectedDriver ? (
        <SelectItemPanel
          action="review"
          area="drivers"
          items={drivers.map((driver) => ({
            id: driver.id,
            label: `${driver.marca} ${driver.modelo} - ${driver.driver?.nome || "Driver"}`
          }))}
          title="Qual driver deseja revisar?"
        />
      ) : null}

      {action === "edit" && selectedDriver ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Editar dados permitidos" icon={ShieldCheck} title={`${selectedDriver.marca} ${selectedDriver.modelo}`} />
          <DriverEditForm driver={selectedDriver} />
        </section>
      ) : null}

      {action === "review" && selectedDriver ? <ReviewPanel content={selectedDriver} type="driver" /> : null}
    </>
  );
}

function AppsArea({ action, apps, selectedId }) {
  const selectedApp = apps.find((app) => app.id === selectedId);

  return (
    <>
      <AreaHeader area="apps" />

      <section className={styles.panel}>
        <AreaToolbar
          count={`${apps.length} itens`}
          eyebrow="Aplicativos internos"
          title="Escolha como deseja gerenciar os aplicativos"
        />
        <p className={styles.sectionNote}>
          Aplicativos internos nao podem ser excluidos. Os instaladores cadastrados ficam protegidos.
        </p>
        <ActionCards
          actions={[
            { href: "/admin?area=apps&action=create", icon: PlusCircle, label: "Adicionar aplicativo" },
            { href: "/admin?area=apps&action=edit", icon: Pencil, label: "Editar aplicativo" },
            { href: "/admin?area=apps&action=review", icon: Eye, label: "Revisar aplicativo", secondary: true }
          ]}
        />
        <ResourceGrid
          items={apps.map((app) => ({
            id: app.id,
            title: app.nome,
            eyebrow: app.categoria,
            description: app.descricao,
            meta: [app.versao || "Sem versao", app.status || "Disponivel"]
          }))}
        />
      </section>

      {action === "create" ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Novo aplicativo" icon={FilePlus2} title="Adicionar aplicativo interno" />
          <AppCreateForm />
        </section>
      ) : null}

      {action === "edit" && !selectedApp ? (
        <SelectItemPanel
          action="edit"
          area="apps"
          items={apps.map((app) => ({ id: app.id, label: app.nome }))}
          title="Qual aplicativo deseja editar?"
        />
      ) : null}

      {action === "review" && !selectedApp ? (
        <SelectItemPanel
          action="review"
          area="apps"
          items={apps.map((app) => ({ id: app.id, label: app.nome }))}
          title="Qual aplicativo deseja revisar?"
        />
      ) : null}

      {action === "edit" && selectedApp ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Editar dados permitidos" icon={ShieldCheck} title={selectedApp.nome} />
          <AppEditForm app={selectedApp} />
        </section>
      ) : null}

      {action === "review" && selectedApp ? <ReviewPanel content={selectedApp} type="app" /> : null}
    </>
  );
}

function GuidesArea({ action, apps, drivers, selectedId }) {
  const selectedGuide = manualGuides.find((guide) => guide.id === selectedId);

  return (
    <>
      <AreaHeader area="guides" />

      <section className={styles.panel}>
        <AreaToolbar count={`${manualGuides.length} itens`} eyebrow="Guias" title="Escolha como deseja gerenciar os guias" />
        <ActionCards
          actions={[
            { href: "/admin?area=guides&action=create", icon: PlusCircle, label: "Criar guia" },
            { href: "/admin?area=guides&action=edit", icon: Pencil, label: "Editar guia" },
            { href: "/admin?area=guides&action=review", icon: Eye, label: "Revisar guia", secondary: true },
            { href: "/admin?area=guides&action=delete", icon: Trash2, label: "Excluir guia", danger: true }
          ]}
        />
        <ResourceGrid
          items={manualGuides.map((guide) => ({
            id: guide.id,
            title: guide.titulo,
            eyebrow: guide.categoria,
            description: guide.descricao,
            meta: [guide.marca, guide.modelo].filter(Boolean)
          }))}
        />
      </section>

      {action === "create" ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Novo guia" icon={BookOpen} title="Criar guia" />
          <GuideForm action={createGuideAction} apps={apps} drivers={drivers} submitLabel="Criar guia" />
        </section>
      ) : null}

      {["edit", "review", "delete"].includes(action) && !selectedGuide ? (
        <SelectItemPanel
          action={action}
          area="guides"
          items={manualGuides.map((guide) => ({ id: guide.id, label: guide.titulo }))}
          title={`Qual guia deseja ${getActionVerb(action)}?`}
        />
      ) : null}

      {action === "edit" && selectedGuide ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Editar guia" icon={BookOpen} title={selectedGuide.titulo} />
          <GuideForm
            action={updateGuideAction}
            apps={apps}
            drivers={drivers}
            guide={selectedGuide}
            submitLabel="Atualizar guia"
          />
        </section>
      ) : null}

      {action === "review" && selectedGuide ? <ReviewPanel content={selectedGuide} type="guide" /> : null}

      {action === "delete" && selectedGuide ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Excluir guia" icon={Trash2} title={selectedGuide.titulo} />
          <ReviewPanel compact content={selectedGuide} type="guide" />
          <DeleteGuideForm id={selectedGuide.id} />
        </section>
      ) : null}
    </>
  );
}

function TutorialsArea({ action, selectedId, tutorials }) {
  const selectedTutorial = tutorials.find((tutorial) => tutorial.id === selectedId);

  return (
    <>
      <AreaHeader area="tutorials" />

      <section className={styles.panel}>
        <AreaToolbar count={`${tutorials.length} itens`} eyebrow="Tutoriais" title="Escolha como deseja gerenciar os tutoriais" />
        <ActionCards
          actions={[
            { href: "/admin?area=tutorials&action=create", icon: PlusCircle, label: "Criar tutorial" },
            { href: "/admin?area=tutorials&action=edit", icon: Pencil, label: "Editar tutorial" },
            { href: "/admin?area=tutorials&action=review", icon: Eye, label: "Revisar tutorial", secondary: true },
            { href: "/admin?area=tutorials&action=delete", icon: Trash2, label: "Excluir tutorial", danger: true }
          ]}
        />
        <ResourceGrid
          items={tutorials.map((tutorial) => ({
            id: tutorial.id,
            title: tutorial.titulo,
            eyebrow: tutorial.categoria,
            description: tutorial.descricao,
            meta: [`${(tutorial.passos || []).length} passos`, `${(tutorial.errosComuns || []).length} erros comuns`]
          }))}
        />
      </section>

      {action === "create" ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Novo tutorial" icon={GraduationCap} title="Criar tutorial" />
          <TutorialForm action={createTutorialAction} submitLabel="Criar tutorial" />
        </section>
      ) : null}

      {["edit", "review", "delete"].includes(action) && !selectedTutorial ? (
        <SelectItemPanel
          action={action}
          area="tutorials"
          items={tutorials.map((tutorial) => ({ id: tutorial.id, label: tutorial.titulo }))}
          title={`Qual tutorial deseja ${getActionVerb(action)}?`}
        />
      ) : null}

      {action === "edit" && selectedTutorial ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Editar tutorial" icon={GraduationCap} title={selectedTutorial.titulo} />
          <TutorialForm
            action={updateTutorialAction}
            tutorial={selectedTutorial}
            submitLabel="Atualizar tutorial"
          />
        </section>
      ) : null}

      {action === "review" && selectedTutorial ? <ReviewPanel content={selectedTutorial} type="tutorial" /> : null}

      {action === "delete" && selectedTutorial ? (
        <section className={styles.panel}>
          <AreaToolbar eyebrow="Excluir tutorial" icon={Trash2} title={selectedTutorial.titulo} />
          <ReviewPanel compact content={selectedTutorial} type="tutorial" />
          <DeleteTutorialForm id={selectedTutorial.id} />
        </section>
      ) : null}
    </>
  );
}

function AreaToolbar({ count, eyebrow, icon: Icon = ClipboardCheck, title }) {
  return (
    <div className={styles.toolbar}>
      <div>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {count ? <strong>{count}</strong> : <Icon size={24} />}
    </div>
  );
}

function ActionCards({ actions }) {
  return (
    <div className={styles.actionCardGrid}>
      {actions.map((action) => {
        const Icon = action.icon;
        const className = [
          styles.actionCard,
          action.secondary ? styles.actionCardSecondary : "",
          action.danger ? styles.actionCardDanger : ""
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <Link className={className} href={action.href} key={action.href}>
            <Icon size={19} />
            <span>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function ResourceGrid({ items }) {
  return (
    <div className={styles.itemGrid}>
      {items.map((item) => (
        <article className={styles.itemCard} key={item.id}>
          <span className={styles.itemEyebrow}>{item.eyebrow}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className={styles.itemMeta}>
            {item.meta.map((meta) => (
              <span key={meta}>{meta}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function SelectItemPanel({ action, area, items, title }) {
  return (
    <section className={styles.panel}>
      <AreaToolbar eyebrow="Selecao do item" icon={ListChecks} title={title} />
      <form className={styles.selectForm} method="get">
        <input type="hidden" name="area" value={area} />
        <input type="hidden" name="action" value={action} />
        <label className={styles.field}>
          <span>Item</span>
          <select name="item" defaultValue="" required>
            <option value="" disabled>Selecione um item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button className={styles.submit} type="submit">
          Continuar
        </button>
      </form>
    </section>
  );
}

function DriverCreateForm() {
  return (
    <form action={createDriverAction} className={styles.formGrid}>
      <label className={styles.field}>
        <span>Marca</span>
        <input name="marca" placeholder="Bematech, Epson, Elgin" required />
      </label>
      <label className={styles.field}>
        <span>Modelo</span>
        <input name="modelo" placeholder="MP-4200 TH, TM-T20X, i9" required />
      </label>
      <label className={styles.field}>
        <span>Categoria</span>
        <input name="categoria" defaultValue="Impressora termica" required />
      </label>
      <label className={styles.field}>
        <span>Nome</span>
        <input name="driverName" placeholder="Driver Oficial Windows" required />
      </label>
      <label className={styles.field}>
        <span>Versao</span>
        <input name="versao" placeholder="v1.0, Windows 64 bits" required />
      </label>
      <label className={styles.field}>
        <span>Arquivo inicial</span>
        <input className={styles.fileInput} name="arquivo" type="file" accept=".zip,.rar,.7z,.exe,.msi" required />
      </label>
      <label className={styles.wideField}>
        <span>Compatibilidade</span>
        <input name="compatibilidade" placeholder="Windows 11, Windows 10 64-bit" />
      </label>
      <label className={styles.wideField}>
        <span>Metadados</span>
        <input name="keywords" placeholder="4200, termica, usb, driver" />
      </label>
      <label className={styles.wideField}>
        <span>Descricao</span>
        <textarea name="descricao" placeholder="Descreva o uso do driver e contexto de instalacao." required />
      </label>
      <button className={styles.submit} type="submit">
        <Save size={17} />
        Adicionar driver
      </button>
    </form>
  );
}

function DriverEditForm({ driver }) {
  return (
    <form action={updateDriverAction} className={styles.formGrid}>
      <input type="hidden" name="id" value={driver.id} />
      <label className={styles.field}>
        <span>Nome</span>
        <input name="driverName" defaultValue={driver.driver?.nome || ""} required />
      </label>
      <label className={styles.field}>
        <span>Categoria</span>
        <input name="categoria" defaultValue={driver.categoria} required />
      </label>
      <label className={styles.field}>
        <span>Versao</span>
        <input name="versao" defaultValue={driver.driver?.versao || ""} required />
      </label>
      <label className={styles.field}>
        <span>Compatibilidade</span>
        <input name="compatibilidade" defaultValue={(driver.compatibilidade || []).join(", ")} />
      </label>
      <label className={styles.wideField}>
        <span>Descricao</span>
        <textarea name="descricao" defaultValue={driver.descricao} required />
      </label>
      <label className={styles.wideField}>
        <span>Observacoes</span>
        <textarea name="observacoes" defaultValue={(driver.observacoes || []).join("\n")} />
      </label>
      <label className={styles.wideField}>
        <span>Metadados</span>
        <textarea
          name="metadados"
          defaultValue={driver.metadados || (driver.keywords || []).join(", ")}
          placeholder="Palavras-chave, familia, sistema operacional, contexto de suporte"
        />
      </label>
      <ProtectedFile text={`Arquivo protegido: ${driver.driver?.downloadUrl || "sem arquivo vinculado"}`} />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        Salvar dados
      </button>
    </form>
  );
}

function AppCreateForm() {
  return (
    <form action={createInternalAppAction} className={styles.formGrid}>
      <label className={styles.field}>
        <span>Nome</span>
        <input name="nome" placeholder="TAKEAT Printer" required />
      </label>
      <label className={styles.field}>
        <span>Categoria</span>
        <input name="categoria" defaultValue="Aplicativo interno" required />
      </label>
      <label className={styles.field}>
        <span>Versao</span>
        <input name="versao" placeholder="v1.0" />
      </label>
      <label className={styles.wideField}>
        <span>Descricao</span>
        <textarea name="descricao" placeholder="Descreva o uso interno do aplicativo." required />
      </label>
      <label className={styles.wideField}>
        <span>Observacoes</span>
        <textarea name="observacoes" />
      </label>
      <label className={styles.wideField}>
        <span>Metadados</span>
        <textarea name="metadados" placeholder="Palavras-chave, uso interno, requisitos, contexto de suporte" />
      </label>
      <ProtectedFile text="Arquivo protegido: nenhum arquivo sera alterado nesta acao." />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        Adicionar aplicativo
      </button>
    </form>
  );
}

function AppEditForm({ app }) {
  return (
    <form action={updateInternalAppAction} className={styles.formGrid}>
      <input type="hidden" name="id" value={app.id} />
      <label className={styles.field}>
        <span>Nome</span>
        <input name="nome" defaultValue={app.nome || ""} required />
      </label>
      <label className={styles.field}>
        <span>Categoria</span>
        <input name="categoria" defaultValue={app.categoria || ""} required />
      </label>
      <label className={styles.field}>
        <span>Versao</span>
        <input name="versao" defaultValue={app.versao || ""} />
      </label>
      <label className={styles.field}>
        <span>Status</span>
        <input value={app.status || "Disponivel"} readOnly />
      </label>
      <label className={styles.wideField}>
        <span>Descricao</span>
        <textarea name="descricao" defaultValue={app.descricao || ""} required />
      </label>
      <label className={styles.wideField}>
        <span>Observacoes</span>
        <textarea name="observacoes" defaultValue={(app.observacoes || []).join("\n")} />
      </label>
      <label className={styles.wideField}>
        <span>Metadados</span>
        <textarea
          name="metadados"
          defaultValue={app.metadados || (app.keywords || []).join(", ")}
          placeholder="Palavras-chave, uso interno, requisitos, contexto de suporte"
        />
      </label>
      <ProtectedFile text={`Arquivo protegido: ${app.download?.downloadUrl || app.status || "sem arquivo vinculado"}`} />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        Salvar dados
      </button>
    </form>
  );
}

function ProtectedFile({ text }) {
  return (
    <div className={styles.protectedFile}>
      <ShieldCheck size={18} />
      <span>{text}</span>
    </div>
  );
}

function GuideForm({ action, apps, drivers, guide, submitLabel }) {
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
        addLabel="Adicionar passo"
        initialItems={guide?.passos || ["Baixe o driver da impressora", "Execute o instalador como administrador"]}
        label="Passo a passo"
        name="passos"
        placeholder="Passo"
      />
      <DynamicListField
        addLabel="Adicionar erro"
        initialItems={(guide?.errosComuns || []).map((issue) => `${issue.problema} => ${issue.solucao}`)}
        label="Erros comuns de impressora"
        name="errosComuns"
        placeholder="Problema => solucao"
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
        addLabel="Adicionar passo"
        initialItems={tutorial?.passos || ["Pressione Windows + R", "Digite ncpa.cpl", "Configure IPv4"]}
        label="Passo a passo"
        name="passos"
        placeholder="Passo"
      />
      <DynamicListField
        addLabel="Adicionar erro"
        initialItems={(tutorial?.errosComuns || []).map((issue) => `${issue.problema} => ${issue.solucao}`)}
        label="Erros comuns de impressora"
        name="errosComuns"
        placeholder="Problema => solucao"
      />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        {submitLabel}
      </button>
    </form>
  );
}

function DeleteGuideForm({ id }) {
  return (
    <form action={deleteGuideAction} className={styles.deletePanel}>
      <input type="hidden" name="id" value={id} />
      <div>
        <strong>Confirmar exclusao</strong>
        <span>Esta acao e permitida somente para guias e tutoriais.</span>
      </div>
      <button className={styles.danger} type="submit">
        <Trash2 size={17} />
        Excluir guia
      </button>
    </form>
  );
}

function DeleteTutorialForm({ id }) {
  return (
    <form action={deleteTutorialAction} className={styles.deletePanel}>
      <input type="hidden" name="id" value={id} />
      <div>
        <strong>Confirmar exclusao</strong>
        <span>Esta acao e permitida somente para guias e tutoriais.</span>
      </div>
      <button className={styles.danger} type="submit">
        <Trash2 size={17} />
        Excluir tutorial
      </button>
    </form>
  );
}

function ReviewPanel({ compact = false, content, type }) {
  const details = getReviewDetails(content, type);
  const title = details.title;

  return (
    <section className={compact ? styles.reviewEmbedded : styles.panel}>
      <AreaToolbar eyebrow="Revisar informacoes" icon={Eye} title={title} />
      <dl className={styles.reviewGrid}>
        {details.stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.readOnlyBox}>
        <strong>Descricao</strong>
        <p>{details.description}</p>
      </div>
      {details.file ? <ProtectedFile text={details.file} /> : null}
      {details.editHref ? (
        <div className={styles.actionRow}>
          <Link className={styles.secondaryLink} href={details.editHref}>
            Editar este item
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function getReviewDetails(content, type) {
  if (type === "driver") {
    return {
      title: `${content.marca} ${content.modelo}`,
      description: content.descricao,
      file: `Arquivo protegido: ${content.driver?.downloadUrl || "sem arquivo vinculado"}`,
      editHref: `/admin?area=drivers&action=edit&item=${content.id}`,
      stats: [
        { label: "Tipo", value: "Driver" },
        { label: "Categoria", value: content.categoria || "Sem categoria" },
        { label: "Versao", value: content.driver?.versao || "Sem versao" },
        { label: "Compatibilidade", value: (content.compatibilidade || []).length || "Nao informada" },
        { label: "Observacoes", value: (content.observacoes || []).length },
        { label: "Metadados", value: (content.keywords || []).length }
      ]
    };
  }

  if (type === "app") {
    return {
      title: content.nome,
      description: content.descricao,
      file: `Arquivo protegido: ${content.download?.downloadUrl || content.status || "sem arquivo vinculado"}`,
      editHref: `/admin?area=apps&action=edit&item=${content.id}`,
      stats: [
        { label: "Tipo", value: "Aplicativo" },
        { label: "Categoria", value: content.categoria || "Sem categoria" },
        { label: "Versao", value: content.versao || "Sem versao" },
        { label: "Status", value: content.status || "Disponivel" },
        { label: "Observacoes", value: (content.observacoes || []).length },
        { label: "Metadados", value: (content.keywords || []).length }
      ]
    };
  }

  const isTutorial = type === "tutorial";

  return {
    title: content.titulo,
    description: content.descricao,
    editHref: `/admin?area=${isTutorial ? "tutorials" : "guides"}&action=edit&item=${content.id}`,
    stats: [
      { label: "Tipo", value: isTutorial ? "Tutorial" : "Guia" },
      { label: "Categoria", value: content.categoria || "Sem categoria" },
      { label: "Passos", value: (content.passos || []).length },
      { label: "Erros comuns", value: (content.errosComuns || []).length },
      { label: "Observacoes", value: (content.observacoes || []).length },
      { label: "Metadados", value: (content.keywords || content.tags || []).length }
    ]
  };
}

function AdminMessages({ params }) {
  const messages = [
    getParam(params, "created") ? `Driver cadastrado com sucesso: ${getParam(params, "created")}` : "",
    getParam(params, "updated") ? `Driver atualizado com sucesso: ${getParam(params, "updated")}` : "",
    getParam(params, "appCreated") ? `Aplicativo cadastrado com sucesso: ${getParam(params, "appCreated")}` : "",
    getParam(params, "appUpdated") ? `Aplicativo atualizado com sucesso: ${getParam(params, "appUpdated")}` : "",
    getParam(params, "guideCreated") ? `Guia criado com sucesso: ${getParam(params, "guideCreated")}` : "",
    getParam(params, "guideUpdated") ? `Guia atualizado com sucesso: ${getParam(params, "guideUpdated")}` : "",
    getParam(params, "guideDeleted") ? `Guia excluido com sucesso: ${getParam(params, "guideDeleted")}` : "",
    getParam(params, "tutorialCreated") ? `Tutorial criado com sucesso: ${getParam(params, "tutorialCreated")}` : "",
    getParam(params, "tutorialUpdated") ? `Tutorial atualizado com sucesso: ${getParam(params, "tutorialUpdated")}` : "",
    getParam(params, "tutorialDeleted") ? `Tutorial excluido com sucesso: ${getParam(params, "tutorialDeleted")}` : ""
  ].filter(Boolean);
  const error = getParam(params, "error");

  return (
    <>
      {messages.map((message) => (
        <div className={styles.notice} key={message}>{message}</div>
      ))}
      {error ? <div className={styles.error}>{error}</div> : null}
    </>
  );
}

function getActionVerb(action) {
  if (action === "review") return "revisar";
  if (action === "delete") return "excluir";
  return "editar";
}

function normalizeAction(action) {
  return action;
}

function normalizeArea(area) {
  return Object.keys(adminAreas).includes(area) ? area : "";
}

function getParam(params, key) {
  const value = params?.[key];

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}
