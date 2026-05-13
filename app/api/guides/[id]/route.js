import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requestToFormData, requireAdminApi } from "@/lib/api/request";
import { deleteGuideFromForm, updateGuideFromForm } from "@/services/adminGuideService";
import { getGuidesData } from "@/services/dataRepository";

export async function GET(_request, context) {
  const { id } = await context.params;
  const guide = (await getGuidesData()).find((item) => item.id === id || item.slug === id);

  if (!guide) {
    return NextResponse.json({ ok: false, error: "Guia nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: guide });
}

export async function PATCH(request, context) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const formData = await requestToFormData(request);
  formData.set("id", id);
  const result = await updateGuideFromForm(formData);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  revalidatePath("/guias");
  revalidatePath(result.guide?.url || "/guias");
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
  const result = await deleteGuideFromForm(formData);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  revalidatePath("/guias");
  return NextResponse.json(result);
}
