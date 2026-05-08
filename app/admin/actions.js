"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin, signOutAdmin } from "@/lib/auth/server";
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
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const result = await createDriverFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/");
  revalidatePath("/drivers");
  revalidatePath("/guias");
  revalidatePath(result.driver.guiaInstalacao.url);

  redirect(`/admin?created=${encodeURIComponent(result.driver.id)}`);
}

export async function updateDriverAction(formData) {
  await requireAdmin();

  const result = await updateDriverEditableFieldsFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/");
  revalidatePath("/drivers");
  revalidatePath("/guias");
  revalidatePath(result.driver.guiaInstalacao?.url || "/guias");

  redirect(`/admin?updated=${encodeURIComponent(result.driver.id)}`);
}

export async function createGuideAction(formData) {
  await requireAdmin();

  const result = await createGuideFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/guias");
  revalidatePath(result.guide ? `/guias/${result.guide.marca}/${result.guide.modelo}` : "/guias");

  redirect(`/admin?guideCreated=${encodeURIComponent(result.guide.id)}`);
}

export async function updateGuideAction(formData) {
  await requireAdmin();

  const result = await updateGuideFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/guias");
  redirect(`/admin?guideUpdated=${encodeURIComponent(result.guide.id)}`);
}

export async function deleteGuideAction(formData) {
  await requireAdmin();

  const result = await deleteGuideFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/guias");
  redirect(`/admin?guideDeleted=${encodeURIComponent(result.id)}`);
}

export async function createTutorialAction(formData) {
  await requireAdmin();

  const result = await createTutorialFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/tutoriais");
  revalidatePath(`/tutoriais/${result.tutorial.id}`);
  redirect(`/admin?tutorialCreated=${encodeURIComponent(result.tutorial.id)}`);
}

export async function updateTutorialAction(formData) {
  await requireAdmin();

  const result = await updateTutorialFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/tutoriais");
  revalidatePath(`/tutoriais/${result.tutorial.id}`);
  redirect(`/admin?tutorialUpdated=${encodeURIComponent(result.tutorial.id)}`);
}

export async function deleteTutorialAction(formData) {
  await requireAdmin();

  const result = await deleteTutorialFromForm(formData);

  if (!result.ok) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/tutoriais");
  redirect(`/admin?tutorialDeleted=${encodeURIComponent(result.id)}`);
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
