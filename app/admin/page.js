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
  Trash2,
  X
} from "lucide-react";
import { DynamicListField } from "@/components/admin/DynamicListField";
import { MultiDeleteForm } from "@/components/admin/MultiDeleteForm";
import { ToastMessages } from "@/components/admin/ToastMessages";
import { getCurrentAdmin } from "@/lib/auth/server";
import { getInternalApps } from "@/services/appService";
import { getGuidesData } from "@/services/dataRepository";
import { getDrivers } from "@/services/driverService";
import { getLinkedGuideOptions, getLinkedGuideValueForResource } from "@/services/linkedGuideService";
import { getTutorials } from "@/services/tutorialContentService";
import {
  createDriverAction,
  createGuideAction,
  createInternalAppAction,
  createTutorialAction,
  deleteDriversAction,
  deleteGuidesAction,
  deleteInternalAppsAction,
  deleteTutorialsAction,
  logoutAction,
  updateDriverAction,
  updateGuideAction,
  updateInternalAppAction,
  updateTutorialAction
} from "./actions";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

const adminAreas = {
  drivers: {
    title: "Gerenciar drivers de impressoras termicas",
    shortTitle: "Drivers",
    description: "Cadastre, edite e exclua drivers de impressoras termicas. Arquivos existentes ficam protegidos na edicao.",
    icon: DownloadCloud
  },
  apps: {
    title: "Gerenciar Aplicativos Internos",
    shortTitle: "Aplicativos internos",
    description: "Organize, edite e exclua aplicativos internos. Instaladores ja cadastrados ficam protegidos na edicao.",
    icon: AppWindow
  },
  guides: {
    title: "Gerenciar Guias",
    shortTitle: "Guias",
    description: "Crie, edite, visualize e exclua guias de instalacao.",
    icon: BookOpen
  },
  tutorials: {
    title: "Gerenciar Tutoriais",
    shortTitle: "Tutoriais",
    description: "Crie, edite, visualize e exclua tutoriais gerais.",
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
  const drivers = await getDrivers();
  const apps = await getInternalApps();
  const tutorials = await getTutorials();
  const manualGuides = await getGuidesData();
  const guideOptions = await getLinkedGuideOptions();
  const area = normalizeArea(getParam(params, "area"));
  const action = normalizeAction(getParam(params, "action"));
  const itemId = getParam(params, "item");
  const linkedGuideValue = getParam(params, "linkedGuide");
  const returnContext = getReturnContext(params);

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

      {area === "drivers" ? (
        <DriversArea action={action} drivers={drivers} guideOptions={guideOptions} linkedGuideValue={linkedGuideValue} selectedId={itemId} />
      ) : null}
      {area === "apps" ? (
        <AppsArea action={action} apps={apps} guideOptions={guideOptions} linkedGuideValue={linkedGuideValue} selectedId={itemId} />
      ) : null}
      {area === "guides" ? (
        <GuidesArea action={action} apps={apps} drivers={drivers} guides={manualGuides} returnContext={returnContext} selectedId={itemId} />
      ) : null}
      {area === "tutorials" ? (
        <TutorialsArea action={action} returnContext={returnContext} selectedId={itemId} tutorials={tutorials} />
      ) : null}
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
        <AreaCard area="drivers" count={`${drivers.length} drivers termicos`} />
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

function DriversArea({ action, drivers, guideOptions, linkedGuideValue, selectedId }) {
  const selectedDriver = drivers.find((driver) => driver.id === selectedId);
  const closeHref = "/admin?area=drivers";

  return (
    <>
      <AreaHeader area="drivers" />

      <section className={styles.panel}>
        <AreaToolbar
          count={`${drivers.length} itens`}
          eyebrow="Drivers de impressoras termicas"
          title="Escolha como deseja gerenciar os drivers termicos"
        />
        <p className={styles.sectionNote}>
          A exclusao sempre pede confirmacao antes de remover o driver. Na edicao, o arquivo do driver nao pode ser trocado.
        </p>
        <ActionCards
          actions={[
            { href: "/admin?area=drivers&action=create", icon: PlusCircle, label: "Adicionar driver termico" },
            { href: "/admin?area=drivers&action=edit", icon: Pencil, label: "Editar driver" },
            { href: "/admin?area=drivers&action=review", icon: Eye, label: "Ver driver", secondary: true },
            { href: "/admin?area=drivers&action=delete", icon: Trash2, label: "Excluir drivers", danger: true }
          ]}
        />
        <ResourceGrid
          items={drivers.map((driver) => ({
            id: driver.id,
            title: `${driver.marca} ${driver.modelo}`,
            eyebrow: driver.categoria,
            description: driver.descricao || "Driver de impressora termica sem descricao cadastrada.",
            meta: [driver.driver?.nome, driver.driver?.versao].filter(Boolean)
          }))}
        />
      </section>

      {action === "create" ? (
        <AdminModal closeHref={closeHref} eyebrow="Novo driver termico" icon={FilePlus2} title="Cadastrar driver de impressora termica">
          <DriverCreateForm guideOptions={guideOptions} linkedGuideValue={linkedGuideValue} />
        </AdminModal>
      ) : null}

      {action === "edit" && !selectedDriver ? (
        <AdminModal closeHref={closeHref} eyebrow="Escolha do item" icon={ListChecks} title="Qual driver deseja editar?">
          <SelectItemForm
            action="edit"
            area="drivers"
            items={drivers.map((driver) => ({
              id: driver.id,
              label: `${driver.marca} ${driver.modelo} - ${driver.driver?.nome || "Driver"}`
            }))}
          />
        </AdminModal>
      ) : null}

      {action === "review" && !selectedDriver ? (
        <AdminModal closeHref={closeHref} eyebrow="Escolha do item" icon={ListChecks} title="Qual driver deseja ver?">
          <SelectItemForm
            action="review"
            area="drivers"
            items={drivers.map((driver) => ({
              id: driver.id,
              label: `${driver.marca} ${driver.modelo} - ${driver.driver?.nome || "Driver"}`
            }))}
          />
        </AdminModal>
      ) : null}

      {action === "edit" && selectedDriver ? (
        <AdminModal closeHref={closeHref} eyebrow="Editar informacoes" icon={ShieldCheck} title={`${selectedDriver.marca} ${selectedDriver.modelo}`}>
          <DriverEditForm driver={selectedDriver} guideOptions={guideOptions} linkedGuideValue={linkedGuideValue} />
        </AdminModal>
      ) : null}

      {action === "review" && selectedDriver ? (
        <AdminModal closeHref={closeHref} eyebrow="Ver driver" icon={Eye} title={`${selectedDriver.marca} ${selectedDriver.modelo}`}>
          <ReviewPanel content={selectedDriver} type="driver" />
        </AdminModal>
      ) : null}

      {action === "delete" ? (
        <AdminModal closeHref={closeHref} eyebrow="Confirmar exclusao" icon={Trash2} title="Excluir drivers">
          <MultiDeleteForm
            action={deleteDriversAction}
            cancelHref={closeHref}
            emptyMessage="Nenhum driver disponivel para excluir."
            items={drivers.map((driver) => ({
              id: driver.id,
              title: `${driver.marca} ${driver.modelo}`,
              description: driver.driver?.nome || driver.categoria
            }))}
            noun="driver"
          />
        </AdminModal>
      ) : null}
    </>
  );
}

function AppsArea({ action, apps, guideOptions, linkedGuideValue, selectedId }) {
  const selectedApp = apps.find((app) => app.id === selectedId);
  const closeHref = "/admin?area=apps";

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
          A exclusao sempre pede confirmacao antes de remover o aplicativo. Os instaladores cadastrados ficam protegidos na edicao.
        </p>
        <ActionCards
          actions={[
            { href: "/admin?area=apps&action=create", icon: PlusCircle, label: "Adicionar aplicativo" },
            { href: "/admin?area=apps&action=edit", icon: Pencil, label: "Editar aplicativo" },
            { href: "/admin?area=apps&action=review", icon: Eye, label: "Ver aplicativo", secondary: true },
            { href: "/admin?area=apps&action=delete", icon: Trash2, label: "Excluir aplicativos", danger: true }
          ]}
        />
        <ResourceGrid
          items={apps.map((app) => ({
            id: app.id,
            title: app.nome,
            eyebrow: app.categoria,
            description: app.descricao || "Aplicativo interno sem descricao cadastrada.",
            meta: [app.versao || "Sem versao", app.status || "Disponivel"]
          }))}
        />
      </section>

      {action === "create" ? (
        <AdminModal closeHref={closeHref} eyebrow="Novo aplicativo" icon={FilePlus2} title="Adicionar aplicativo">
          <AppCreateForm guideOptions={guideOptions} linkedGuideValue={linkedGuideValue} />
        </AdminModal>
      ) : null}

      {action === "edit" && !selectedApp ? (
        <AdminModal closeHref={closeHref} eyebrow="Escolha do item" icon={ListChecks} title="Qual aplicativo deseja editar?">
          <SelectItemForm
            action="edit"
            area="apps"
            items={apps.map((app) => ({ id: app.id, label: app.nome }))}
          />
        </AdminModal>
      ) : null}

      {action === "review" && !selectedApp ? (
        <AdminModal closeHref={closeHref} eyebrow="Escolha do item" icon={ListChecks} title="Qual aplicativo deseja ver?">
          <SelectItemForm
            action="review"
            area="apps"
            items={apps.map((app) => ({ id: app.id, label: app.nome }))}
          />
        </AdminModal>
      ) : null}

      {action === "edit" && selectedApp ? (
        <AdminModal closeHref={closeHref} eyebrow="Editar informacoes" icon={ShieldCheck} title={selectedApp.nome}>
          <AppEditForm app={selectedApp} guideOptions={guideOptions} linkedGuideValue={linkedGuideValue} />
        </AdminModal>
      ) : null}

      {action === "review" && selectedApp ? (
        <AdminModal closeHref={closeHref} eyebrow="Ver aplicativo" icon={Eye} title={selectedApp.nome}>
          <ReviewPanel content={selectedApp} type="app" />
        </AdminModal>
      ) : null}

      {action === "delete" ? (
        <AdminModal closeHref={closeHref} eyebrow="Confirmar exclusao" icon={Trash2} title="Excluir aplicativos internos">
          <MultiDeleteForm
            action={deleteInternalAppsAction}
            cancelHref={closeHref}
            emptyMessage="Nenhum aplicativo disponivel para excluir."
            items={apps.map((app) => ({
              id: app.id,
              title: app.nome,
              description: app.categoria
            }))}
            noun="aplicativo"
          />
        </AdminModal>
      ) : null}
    </>
  );
}

function GuidesArea({ action, apps, drivers, guides, returnContext, selectedId }) {
  const selectedGuide = guides.find((guide) => guide.id === selectedId);
  const closeHref = "/admin?area=guides";

  return (
    <>
      <AreaHeader area="guides" />

      <section className={styles.panel}>
        <AreaToolbar count={`${guides.length} itens`} eyebrow="Guias" title="Escolha como deseja gerenciar os guias" />
        <ActionCards
          actions={[
            { href: "/admin?area=guides&action=create", icon: PlusCircle, label: "Criar guia" },
            { href: "/admin?area=guides&action=edit", icon: Pencil, label: "Editar guia" },
            { href: "/admin?area=guides&action=review", icon: Eye, label: "Ver guia", secondary: true },
            { href: "/admin?area=guides&action=delete", icon: Trash2, label: "Excluir guias", danger: true }
          ]}
        />
        <ResourceGrid
          items={guides.map((guide) => ({
            id: guide.id,
            title: guide.titulo,
            eyebrow: guide.categoria,
            description: guide.descricao,
            meta: [guide.marca, guide.modelo].filter(Boolean)
          }))}
        />
      </section>

      {action === "create" ? (
        <AdminModal closeHref={closeHref} eyebrow="Novo guia" icon={BookOpen} title="Criar guia">
          <GuideForm action={createGuideAction} apps={apps} drivers={drivers} returnContext={returnContext} submitLabel="Criar guia" />
        </AdminModal>
      ) : null}

      {["edit", "review"].includes(action) && !selectedGuide ? (
        <AdminModal closeHref={closeHref} eyebrow="Escolha do item" icon={ListChecks} title={`Qual guia deseja ${getActionVerb(action)}?`}>
          <SelectItemForm
            action={action}
            area="guides"
            items={guides.map((guide) => ({ id: guide.id, label: guide.titulo }))}
          />
        </AdminModal>
      ) : null}

      {action === "delete" ? (
        <AdminModal closeHref={closeHref} eyebrow="Confirmar exclusao" icon={Trash2} title="Excluir guias">
          <MultiDeleteForm
            action={deleteGuidesAction}
            cancelHref={closeHref}
            emptyMessage="Nenhum guia manual disponivel para excluir."
            items={guides.map((guide) => ({
              id: guide.id,
              title: guide.titulo,
              description: [guide.categoria, guide.marca, guide.modelo].filter(Boolean).join(" - ")
            }))}
            noun="guia"
          />
        </AdminModal>
      ) : null}

      {action === "edit" && selectedGuide ? (
        <AdminModal closeHref={closeHref} eyebrow="Editar guia" icon={BookOpen} title={selectedGuide.titulo}>
          <GuideForm
            action={updateGuideAction}
            apps={apps}
            drivers={drivers}
            guide={selectedGuide}
            submitLabel="Atualizar guia"
          />
        </AdminModal>
      ) : null}

      {action === "review" && selectedGuide ? (
        <AdminModal closeHref={closeHref} eyebrow="Ver guia" icon={Eye} title={selectedGuide.titulo}>
          <ReviewPanel content={selectedGuide} type="guide" />
        </AdminModal>
      ) : null}

    </>
  );
}

function TutorialsArea({ action, returnContext, selectedId, tutorials }) {
  const selectedTutorial = tutorials.find((tutorial) => tutorial.id === selectedId);
  const closeHref = "/admin?area=tutorials";

  return (
    <>
      <AreaHeader area="tutorials" />

      <section className={styles.panel}>
        <AreaToolbar count={`${tutorials.length} itens`} eyebrow="Tutoriais" title="Escolha como deseja gerenciar os tutoriais" />
        <ActionCards
          actions={[
            { href: "/admin?area=tutorials&action=create", icon: PlusCircle, label: "Criar tutorial" },
            { href: "/admin?area=tutorials&action=edit", icon: Pencil, label: "Editar tutorial" },
            { href: "/admin?area=tutorials&action=review", icon: Eye, label: "Ver tutorial", secondary: true },
            { href: "/admin?area=tutorials&action=delete", icon: Trash2, label: "Excluir tutoriais", danger: true }
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
        <AdminModal closeHref={closeHref} eyebrow="Novo tutorial" icon={GraduationCap} title="Criar tutorial">
          <TutorialForm action={createTutorialAction} returnContext={returnContext} submitLabel="Criar tutorial" />
        </AdminModal>
      ) : null}

      {["edit", "review"].includes(action) && !selectedTutorial ? (
        <AdminModal closeHref={closeHref} eyebrow="Escolha do item" icon={ListChecks} title={`Qual tutorial deseja ${getActionVerb(action)}?`}>
          <SelectItemForm
            action={action}
            area="tutorials"
            items={tutorials.map((tutorial) => ({ id: tutorial.id, label: tutorial.titulo }))}
          />
        </AdminModal>
      ) : null}

      {action === "delete" ? (
        <AdminModal closeHref={closeHref} eyebrow="Confirmar exclusao" icon={Trash2} title="Excluir tutoriais">
          <MultiDeleteForm
            action={deleteTutorialsAction}
            cancelHref={closeHref}
            emptyMessage="Nenhum tutorial disponivel para excluir."
            items={tutorials.map((tutorial) => ({
              id: tutorial.id,
              title: tutorial.titulo,
              description: tutorial.categoria
            }))}
            noun="tutorial"
          />
        </AdminModal>
      ) : null}

      {action === "edit" && selectedTutorial ? (
        <AdminModal closeHref={closeHref} eyebrow="Editar tutorial" icon={GraduationCap} title={selectedTutorial.titulo}>
          <TutorialForm
            action={updateTutorialAction}
            tutorial={selectedTutorial}
            submitLabel="Atualizar tutorial"
          />
        </AdminModal>
      ) : null}

      {action === "review" && selectedTutorial ? (
        <AdminModal closeHref={closeHref} eyebrow="Ver tutorial" icon={Eye} title={selectedTutorial.titulo}>
          <ReviewPanel content={selectedTutorial} type="tutorial" />
        </AdminModal>
      ) : null}

    </>
  );
}

function AdminModal({ children, closeHref, eyebrow, icon: Icon = ClipboardCheck, title }) {
  return (
    <div className={styles.modalOverlay} role="presentation">
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h2 id="admin-modal-title">{title}</h2>
          </div>
          <div className={styles.modalHeaderActions}>
            <Icon size={22} />
            <Link className={styles.modalClose} href={closeHref} aria-label="Fechar modal">
              <X size={20} />
            </Link>
          </div>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </section>
    </div>
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
            {item.meta.map((meta, index) => (
              <span key={`${item.id}-${meta}-${index}`}>{meta}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function SelectItemForm({ action, area, items }) {
  return (
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
  );
}

function DriverCreateForm({ guideOptions, linkedGuideValue }) {
  return (
    <form action={createDriverAction} className={styles.formGrid}>
      <label className={styles.field}>
        <span>Nome do driver/impressora</span>
        <input name="driverName" placeholder="Driver Oficial Windows" required />
      </label>
      <label className={styles.field}>
        <span>Marca</span>
        <input name="marca" placeholder="Bematech, Epson, Elgin" required />
      </label>
      <label className={styles.field}>
        <span>Modelo</span>
        <input name="modelo" placeholder="MP-4200 TH, TM-T20X, i9" required />
      </label>
      <label className={styles.field}>
        <span>Versao (opcional)</span>
        <input name="versao" placeholder="v1.0, Windows 64 bits" />
      </label>
      <label className={styles.field}>
        <span>Arquivo do driver</span>
        <input className={styles.fileInput} name="arquivo" type="file" accept=".zip,.rar,.7z,.exe,.msi" required />
      </label>
      <label className={styles.wideField}>
        <span>Compatibilidade (opcional)</span>
        <input name="compatibilidade" placeholder="Windows 11, Windows 10 64-bit" />
      </label>
      <label className={styles.wideField}>
        <span>Palavras-chave para busca (opcional)</span>
        <input name="keywords" placeholder="4200, termica, usb, driver" />
      </label>
      <label className={styles.wideField}>
        <span>Descricao (opcional)</span>
        <textarea name="descricao" placeholder="Descreva o uso do driver termico e contexto de instalacao." />
      </label>
      <LinkedGuideField
        defaultValue={linkedGuideValue}
        guideOptions={guideOptions}
        returnContext={{ area: "drivers", action: "create" }}
      />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        Adicionar driver termico
      </button>
    </form>
  );
}

function DriverEditForm({ driver, guideOptions, linkedGuideValue }) {
  const selectedGuideValue = linkedGuideValue || getLinkedGuideValueForResource(driver, guideOptions);

  return (
    <form action={updateDriverAction} className={styles.formGrid}>
      <input type="hidden" name="id" value={driver.id} />
      <label className={styles.field}>
        <span>Nome do driver/impressora</span>
        <input name="driverName" defaultValue={driver.driver?.nome || ""} required />
      </label>
      <label className={styles.field}>
        <span>Versao (opcional)</span>
        <input name="versao" defaultValue={driver.driver?.versao || ""} />
      </label>
      <label className={styles.field}>
        <span>Compatibilidade (opcional)</span>
        <input name="compatibilidade" defaultValue={(driver.compatibilidade || []).join(", ")} />
      </label>
      <label className={styles.wideField}>
        <span>Descricao (opcional)</span>
        <textarea name="descricao" defaultValue={driver.descricao} />
      </label>
      <label className={styles.wideField}>
        <span>Observacoes (opcional)</span>
        <textarea name="observacoes" defaultValue={(driver.observacoes || []).join("\n")} />
      </label>
      <label className={styles.wideField}>
        <span>Termos que ajudam na pesquisa (opcional)</span>
        <textarea
          name="metadados"
          defaultValue={driver.metadados || (driver.keywords || []).join(", ")}
          placeholder="Palavras-chave, familia, sistema operacional, contexto de suporte"
        />
      </label>
      <LinkedGuideField
        defaultValue={selectedGuideValue}
        guideOptions={guideOptions}
        returnContext={{ area: "drivers", action: "edit", item: driver.id }}
      />
      <ProtectedFile text={`Arquivo protegido: ${driver.driver?.downloadUrl || "sem arquivo vinculado"}`} />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        Salvar dados
      </button>
    </form>
  );
}

function AppCreateForm({ guideOptions, linkedGuideValue }) {
  return (
    <form action={createInternalAppAction} className={styles.formGrid}>
      <label className={styles.field}>
        <span>Nome</span>
        <input name="nome" placeholder="TAKEAT Printer" required />
      </label>
      <label className={styles.field}>
        <span>Categoria (opcional)</span>
        <input name="categoria" defaultValue="Aplicativo interno" />
      </label>
      <label className={styles.field}>
        <span>Versao (opcional)</span>
        <input name="versao" placeholder="v1.0" />
      </label>
      <label className={styles.field}>
        <span>Arquivo do aplicativo</span>
        <input className={styles.fileInput} name="arquivo" type="file" accept=".zip,.rar,.7z,.exe,.msi" required />
      </label>
      <label className={styles.wideField}>
        <span>Descricao (opcional)</span>
        <textarea name="descricao" placeholder="Descreva o uso interno do aplicativo." />
      </label>
      <label className={styles.wideField}>
        <span>Observacoes (opcional)</span>
        <textarea name="observacoes" />
      </label>
      <label className={styles.wideField}>
        <span>Palavras-chave para busca (opcional)</span>
        <textarea name="metadados" placeholder="Palavras-chave, uso interno, requisitos, contexto de suporte" />
      </label>
      <LinkedGuideField
        defaultValue={linkedGuideValue}
        guideOptions={guideOptions}
        returnContext={{ area: "apps", action: "create" }}
      />
      <ProtectedFile text="Arquivo protegido: depois de cadastrado, o instalador nao sera substituido nesta tela." />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        Adicionar aplicativo
      </button>
    </form>
  );
}

function AppEditForm({ app, guideOptions, linkedGuideValue }) {
  const selectedGuideValue = linkedGuideValue || getLinkedGuideValueForResource(app, guideOptions);

  return (
    <form action={updateInternalAppAction} className={styles.formGrid}>
      <input type="hidden" name="id" value={app.id} />
      <label className={styles.field}>
        <span>Nome</span>
        <input name="nome" defaultValue={app.nome || ""} required />
      </label>
      <label className={styles.field}>
        <span>Categoria (opcional)</span>
        <input name="categoria" defaultValue={app.categoria || ""} />
      </label>
      <label className={styles.field}>
        <span>Versao (opcional)</span>
        <input name="versao" defaultValue={app.versao || ""} />
      </label>
      <label className={styles.field}>
        <span>Status</span>
        <input value={app.status || "Disponivel"} readOnly />
      </label>
      <label className={styles.wideField}>
        <span>Descricao (opcional)</span>
        <textarea name="descricao" defaultValue={app.descricao || ""} />
      </label>
      <label className={styles.wideField}>
        <span>Observacoes (opcional)</span>
        <textarea name="observacoes" defaultValue={(app.observacoes || []).join("\n")} />
      </label>
      <label className={styles.wideField}>
        <span>Termos que ajudam na pesquisa (opcional)</span>
        <textarea
          name="metadados"
          defaultValue={app.metadados || (app.keywords || []).join(", ")}
          placeholder="Palavras-chave, uso interno, requisitos, contexto de suporte"
        />
      </label>
      <LinkedGuideField
        defaultValue={selectedGuideValue}
        guideOptions={guideOptions}
        returnContext={{ area: "apps", action: "edit", item: app.id }}
      />
      <ProtectedFile text={`Arquivo protegido: ${app.download?.downloadUrl || app.status || "sem arquivo vinculado"}`} />
      <button className={styles.submit} type="submit">
        <Save size={17} />
        Salvar dados
      </button>
    </form>
  );
}

function LinkedGuideField({ defaultValue = "", guideOptions = [], returnContext }) {
  return (
    <div className={styles.linkedGuideField}>
      <label className={styles.wideField}>
        <span>Guia de instalacao vinculado</span>
        <select name="guiaVinculado" defaultValue={defaultValue}>
          <option value="">Nenhum guia vinculado</option>
          {guideOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.inlineHelper}>
        <span>Guia nao cadastrado?</span>
        <Link href={buildRelatedContentHref("guides", returnContext)}>Criar guia de instalacao</Link>
        <Link href={buildRelatedContentHref("tutorials", returnContext)}>Criar tutorial</Link>
      </div>
    </div>
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

function GuideForm({ action, apps, drivers, guide, returnContext, submitLabel }) {
  return (
    <form action={action} className={styles.formGrid}>
      {guide ? <input type="hidden" name="id" value={guide.id} /> : null}
      <ReturnContextFields returnContext={returnContext} />
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

function TutorialForm({ action, returnContext, tutorial, submitLabel }) {
  return (
    <form action={action} className={styles.formGrid}>
      {tutorial ? <input type="hidden" name="id" value={tutorial.id} /> : null}
      <ReturnContextFields returnContext={returnContext} />
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

function ReturnContextFields({ returnContext }) {
  if (!returnContext?.area || !returnContext?.action) {
    return null;
  }

  return (
    <>
      <input type="hidden" name="returnArea" value={returnContext.area} />
      <input type="hidden" name="returnAction" value={returnContext.action} />
      {returnContext.item ? <input type="hidden" name="returnItem" value={returnContext.item} /> : null}
    </>
  );
}

function ReviewPanel({ compact = false, content, type }) {
  const details = getReviewDetails(content, type);

  return (
    <div className={compact ? styles.reviewEmbedded : styles.reviewContent}>
      <dl className={styles.reviewGrid}>
        {details.stats.map((stat, index) => (
          <div key={`${stat.label}-${index}`}>
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
      {details.editHref && !compact ? (
        <div className={styles.actionRow}>
          <Link className={styles.secondaryLink} href={details.editHref}>
            Editar este item
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function getReviewDetails(content, type) {
  if (type === "driver") {
    return {
      title: `${content.marca} ${content.modelo}`,
      description: content.descricao || "Driver de impressora termica sem descricao cadastrada.",
      file: `Arquivo protegido: ${content.driver?.downloadUrl || "sem arquivo vinculado"}`,
      editHref: `/admin?area=drivers&action=edit&item=${content.id}`,
      stats: [
        { label: "Item", value: "Driver" },
        { label: "Categoria", value: "Impressora termica" },
        { label: "Versao", value: content.driver?.versao || "Sem versao" },
        { label: "Guia vinculado", value: content.guiaVinculado?.titulo || content.guiaInstalacao?.titulo || "Nao informado" },
        { label: "Compatibilidade", value: (content.compatibilidade || []).length || "Nao informada" },
        { label: "Observacoes", value: (content.observacoes || []).length },
        { label: "Palavras-chave", value: (content.keywords || []).length }
      ]
    };
  }

  if (type === "app") {
    return {
      title: content.nome,
      description: content.descricao || "Aplicativo interno sem descricao cadastrada.",
      file: `Arquivo protegido: ${content.download?.downloadUrl || content.status || "sem arquivo vinculado"}`,
      editHref: `/admin?area=apps&action=edit&item=${content.id}`,
      stats: [
        { label: "Tipo", value: "Aplicativo" },
        { label: "Categoria", value: content.categoria || "Sem categoria" },
        { label: "Versao", value: content.versao || "Sem versao" },
        { label: "Status", value: content.status || "Disponivel" },
        { label: "Guia vinculado", value: content.guiaVinculado?.titulo || "Nao informado" },
        { label: "Observacoes", value: (content.observacoes || []).length },
        { label: "Palavras-chave", value: (content.keywords || []).length }
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
      { label: "Palavras-chave", value: (content.keywords || content.tags || []).length }
    ]
  };
}

function AdminMessages({ params }) {
  const messages = [
    getParam(params, "created") ? "Driver cadastrado com sucesso." : "",
    getParam(params, "updated") ? "Driver atualizado com sucesso." : "",
    getParam(params, "driversDeleted") ? buildDeleteMessage(getParam(params, "driversDeleted"), "Driver", "drivers") : "",
    getParam(params, "appCreated") ? "Aplicativo interno cadastrado com sucesso." : "",
    getParam(params, "appUpdated") ? "Aplicativo interno atualizado com sucesso." : "",
    getParam(params, "appsDeleted") ? buildDeleteMessage(getParam(params, "appsDeleted"), "Aplicativo interno", "aplicativos internos") : "",
    getParam(params, "guideCreated") ? "Guia criado com sucesso." : "",
    getParam(params, "guideUpdated") ? "Guia atualizado com sucesso." : "",
    getParam(params, "guideDeleted") ? "Guia excluido com sucesso." : "",
    getParam(params, "guidesDeleted") ? buildDeleteMessage(getParam(params, "guidesDeleted"), "Guia", "guias") : "",
    getParam(params, "tutorialCreated") ? "Tutorial criado com sucesso." : "",
    getParam(params, "tutorialUpdated") ? "Tutorial atualizado com sucesso." : "",
    getParam(params, "tutorialDeleted") ? "Tutorial excluido com sucesso." : "",
    getParam(params, "tutorialsDeleted") ? buildDeleteMessage(getParam(params, "tutorialsDeleted"), "Tutorial", "tutoriais") : ""
  ].filter(Boolean);
  const error = getParam(params, "error");

  return (
    <>
      <ToastMessages error={error} messages={messages} />
    </>
  );
}

function buildDeleteMessage(countValue, singular, plural) {
  const count = Number(countValue) || 1;
  return count === 1
    ? `${singular} excluido com sucesso.`
    : `${count} ${plural} excluidos com sucesso.`;
}

function getActionVerb(action) {
  if (action === "review") return "ver";
  if (action === "delete") return "excluir";
  return "editar";
}

function buildRelatedContentHref(area, returnContext) {
  const params = new URLSearchParams({ area, action: "create" });

  if (returnContext?.area && returnContext?.action) {
    params.set("returnArea", returnContext.area);
    params.set("returnAction", returnContext.action);

    if (returnContext.item) {
      params.set("returnItem", returnContext.item);
    }
  }

  return `/admin?${params.toString()}`;
}

function getReturnContext(params) {
  const area = getParam(params, "returnArea");
  const action = getParam(params, "returnAction");
  const item = getParam(params, "returnItem");

  if (!["drivers", "apps"].includes(area) || !["create", "edit"].includes(action)) {
    return null;
  }

  return { area, action, item };
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
