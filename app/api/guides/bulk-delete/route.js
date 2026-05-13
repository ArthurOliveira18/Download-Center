import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requestToFormData, requireAdminApi } from "@/lib/api/request";
import { deleteGuidesFromForm } from "@/services/adminGuideService";

export async function POST(request) {
  return deleteGuides(request);
}

export async function DELETE(request) {
  return deleteGuides(request);
}

async function deleteGuides(request) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const result = await deleteGuidesFromForm(await requestToFormData(request));

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  revalidatePath("/guias");
  return NextResponse.json(result);
}
