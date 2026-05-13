import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requestToFormData, requireAdminApi } from "@/lib/api/request";
import { createGuideFromForm } from "@/services/adminGuideService";
import { getGuidesData } from "@/services/dataRepository";
import { getGuideRecords } from "@/services/guideContentService";

export async function GET(request) {
  const includeGenerated = request.nextUrl.searchParams.get("includeGenerated") === "1";

  return NextResponse.json({
    ok: true,
    items: includeGenerated ? await getGuideRecords() : await getGuidesData()
  });
}

export async function POST(request) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const result = await createGuideFromForm(await requestToFormData(request));

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  revalidatePath("/guias");
  revalidatePath(result.guide?.url || "/guias");

  return NextResponse.json(result, { status: 201 });
}
