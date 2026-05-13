import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { methodNotAllowed, requestToFormData, requireAdminApi } from "@/lib/api/request";
import { updateInternalAppEditableFieldsFromForm } from "@/services/adminAppService";
import { updateDriverEditableFieldsFromForm } from "@/services/adminDriverService";
import { getInternalApps } from "@/services/appService";
import { getDrivers } from "@/services/driverService";

export async function GET(_request, context) {
  const { id, type } = await context.params;
  const item = await getResource(type, id);

  if (!item) {
    return NextResponse.json({ ok: false, error: "Item nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}

export async function PATCH(request, context) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id, type } = await context.params;
  const formData = await requestToFormData(request);
  formData.set("id", id);

  if (type === "drivers") {
    const result = await updateDriverEditableFieldsFromForm(formData);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    revalidateDownloadPaths(result.driver.guiaVinculado?.url || result.driver.guiaInstalacao?.url);
    return NextResponse.json(result);
  }

  if (type === "apps") {
    const result = await updateInternalAppEditableFieldsFromForm(formData);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    revalidateDownloadPaths(result.app.guiaVinculado?.url);
    return NextResponse.json(result);
  }

  return methodNotAllowed("Tipo de download nao suportado.");
}

export async function DELETE() {
  return methodNotAllowed("Drivers e aplicativos internos nao podem ser excluidos.");
}

async function getResource(type, id) {
  if (type === "drivers") {
    return (await getDrivers()).find((driver) => driver.id === id);
  }

  if (type === "apps") {
    return (await getInternalApps()).find((app) => app.id === id);
  }

  return null;
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
