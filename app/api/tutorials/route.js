import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requestToFormData, requireAdminApi } from "@/lib/api/request";
import { createTutorialFromForm } from "@/services/adminTutorialService";
import { getTutorials } from "@/services/tutorialContentService";

export async function GET() {
  return NextResponse.json({
    ok: true,
    items: await getTutorials()
  });
}

export async function POST(request) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const result = await createTutorialFromForm(await requestToFormData(request));

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  revalidatePath("/tutoriais");
  revalidatePath(result.tutorial?.url || `/tutoriais/${result.tutorial.id}`);

  return NextResponse.json(result, { status: 201 });
}
