import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requestToFormData, requireAdminApi } from "@/lib/api/request";
import { deleteTutorialsFromForm } from "@/services/adminTutorialService";

export async function POST(request) {
  return deleteTutorials(request);
}

export async function DELETE(request) {
  return deleteTutorials(request);
}

async function deleteTutorials(request) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const result = await deleteTutorialsFromForm(await requestToFormData(request));

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  revalidatePath("/tutoriais");
  return NextResponse.json(result);
}
