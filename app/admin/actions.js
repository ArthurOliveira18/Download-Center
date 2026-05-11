"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin, signOutAdmin } from "@/lib/auth/server";
import {
  createInternalAppFromForm,
  updateInternalAppEditableFieldsFromForm
} from "@/services/adminAppService";
import {
  createDriverFromForm,
  updateDriverEditableFieldsFromForm
} from "@/services/adminDriverService";
import {
  createGuideFromForm,
  deleteGuideFromForm,
  updateGuideFromForm
} from "@/services/adminGuideService";
import {
  createTutorialFromForm,
  deleteTutorialFromForm,
  updateTutorialFromForm
} from "@/services/adminTutorialService";

export async function createDriverAction(formData) {
  await requireAdmin();

  const result = await createDriverFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=drivers&action=create&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/");
  revalidatePath("/drivers");
  revalidatePath("/guias");
  revalidatePath(result.driver.guiaInstalacao.url);

  redirect(`/admin?area=drivers&action=edit&item=${encodeURIComponent(result.driver.id)}&created=${encodeURIComponent(result.driver.id)}`);
}

export async function updateDriverAction(formData) {
  await requireAdmin();

  const result = await updateDriverEditableFieldsFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=drivers&action=edit&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/");
  revalidatePath("/drivers");
  revalidatePath("/guias");
  revalidatePath(result.driver.guiaInstalacao?.url || "/guias");

  redirect(`/admin?area=drivers&action=edit&item=${encodeURIComponent(result.driver.id)}&updated=${encodeURIComponent(result.driver.id)}`);
}

export async function createInternalAppAction(formData) {
  await requireAdmin();

  const result = await createInternalAppFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=apps&action=create&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/");
  revalidatePath("/apps");

  redirect(`/admin?area=apps&action=edit&item=${encodeURIComponent(result.app.id)}&appCreated=${encodeURIComponent(result.app.id)}`);
}

export async function updateInternalAppAction(formData) {
  await requireAdmin();

  const result = await updateInternalAppEditableFieldsFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=apps&action=edit&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/");
  revalidatePath("/apps");

  redirect(`/admin?area=apps&action=edit&item=${encodeURIComponent(result.app.id)}&appUpdated=${encodeURIComponent(result.app.id)}`);
}

export async function createGuideAction(formData) {
  await requireAdmin();

  const result = await createGuideFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=guides&action=create&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/guias");
  revalidatePath(result.guide ? `/guias/${result.guide.marca}/${result.guide.modelo}` : "/guias");

  redirect(`/admin?area=guides&action=edit&item=${encodeURIComponent(result.guide.id)}&guideCreated=${encodeURIComponent(result.guide.id)}`);
}

export async function updateGuideAction(formData) {
  await requireAdmin();

  const result = await updateGuideFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=guides&action=edit&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/guias");
  redirect(`/admin?area=guides&action=edit&item=${encodeURIComponent(result.guide.id)}&guideUpdated=${encodeURIComponent(result.guide.id)}`);
}

export async function deleteGuideAction(formData) {
  await requireAdmin();

  const result = await deleteGuideFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=guides&action=delete&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/guias");
  redirect(`/admin?area=guides&guideDeleted=${encodeURIComponent(result.id)}`);
}

export async function createTutorialAction(formData) {
  await requireAdmin();

  const result = await createTutorialFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=tutorials&action=create&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/tutoriais");
  revalidatePath(`/tutoriais/${result.tutorial.id}`);
  redirect(`/admin?area=tutorials&action=edit&item=${encodeURIComponent(result.tutorial.id)}&tutorialCreated=${encodeURIComponent(result.tutorial.id)}`);
}

export async function updateTutorialAction(formData) {
  await requireAdmin();

  const result = await updateTutorialFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=tutorials&action=edit&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/tutoriais");
  revalidatePath(`/tutoriais/${result.tutorial.id}`);
  redirect(`/admin?area=tutorials&action=edit&item=${encodeURIComponent(result.tutorial.id)}&tutorialUpdated=${encodeURIComponent(result.tutorial.id)}`);
}

export async function deleteTutorialAction(formData) {
  await requireAdmin();

  const result = await deleteTutorialFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?area=tutorials&action=edit&error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/tutoriais");
  redirect(`/admin?area=tutorials&tutorialDeleted=${encodeURIComponent(result.id)}`);
}

export async function logoutAction() {
  await signOutAdmin();
  redirect("/admin/login?logout=1");
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
