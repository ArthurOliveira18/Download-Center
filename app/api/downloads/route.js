import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { methodNotAllowed, requestToFormData, requireAdminApi } from "@/lib/api/request";
import { createInternalAppFromForm } from "@/services/adminAppService";
import { createDriverFromForm } from "@/services/adminDriverService";
import { getInternalApps } from "@/services/appService";
import { getDrivers } from "@/services/driverService";

export async function GET() {
  return NextResponse.json({
    ok: true,
    drivers: await getDrivers(),
    apps: await getInternalApps()
  });
}

export async function POST(request) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const formData = await requestToFormData(request);
  const type = String(formData.get("type") || "").trim();

  if (type === "driver") {
    const result = await createDriverFromForm(formData);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    revalidateDownloadPaths(result.driver.guiaVinculado?.url || result.driver.guiaInstalacao?.url);
    return NextResponse.json(result, { status: 201 });
  }

  if (type === "app") {
    const result = await createInternalAppFromForm(formData);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    revalidateDownloadPaths(result.app.guiaVinculado?.url);
    return NextResponse.json(result, { status: 201 });
  }

  return methodNotAllowed("Informe type=driver ou type=app.");
}

function revalidateDownloadPaths(linkedUrl) {
  revalidatePath("/");
  revalidatePath("/drivers");
  revalidatePath("/apps");
  revalidatePath("/guias");

  if (linkedUrl) {
    revalidatePath(linkedUrl);
  }
}
