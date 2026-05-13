import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requestToFormData, requireAdminApi } from "@/lib/api/request";
import { deleteTutorialFromForm, updateTutorialFromForm } from "@/services/adminTutorialService";
import { getTutorialById } from "@/services/tutorialContentService";

export async function GET(_request, context) {
  const { id } = await context.params;
  const tutorial = await getTutorialById(id);

  if (!tutorial) {
    return NextResponse.json({ ok: false, error: "Tutorial nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: tutorial });
}

export async function PATCH(request, context) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const formData = await requestToFormData(request);
  formData.set("id", id);
  const result = await updateTutorialFromForm(formData);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  revalidatePath("/tutoriais");
  revalidatePath(result.tutorial?.url || `/tutoriais/${result.tutorial.id}`);
  return NextResponse.json(result);
}

export async function DELETE(_request, context) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const formData = new FormData();
  formData.set("id", id);
  const result = await deleteTutorialFromForm(formData);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  revalidatePath("/tutoriais");
  return NextResponse.json(result);
}
