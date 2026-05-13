import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/server";

export async function requireAdminApi() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      admin: null,
      response: NextResponse.json({ ok: false, error: "Nao autorizado." }, { status: 401 })
    };
  }

  return { admin, response: null };
}

export async function requestToFormData(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    return request.formData();
  }

  const payload = await request.json().catch(() => ({}));
  return objectToFormData(payload);
}

export function objectToFormData(payload = {}) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, stringifyFormValue(item)));
      return;
    }

    if (value !== undefined && value !== null) {
      formData.set(key, stringifyFormValue(value));
    }
  });

  return formData;
}

export function methodNotAllowed(message = "Metodo nao permitido.") {
  return NextResponse.json({ ok: false, error: message }, { status: 405 });
}

function stringifyFormValue(value) {
  if (typeof value === "object" && !(value instanceof Blob)) {
    return JSON.stringify(value);
  }

  return String(value);
}
