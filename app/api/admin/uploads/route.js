import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/server";
import { createSignedDownloadUpload } from "@/services/supabase/storageService";

export async function POST(request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ ok: false, error: "Sessao administrativa expirada." }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dados de upload invalidos." }, { status: 400 });
  }

  let result;

  try {
    result = await createSignedDownloadUpload({
      contentType: body.contentType,
      fileName: body.fileName,
      fileSize: body.fileSize,
      folder: body.folder,
      nameParts: Array.isArray(body.nameParts) ? body.nameParts : []
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Nao foi possivel preparar o upload." },
      { status: 500 }
    );
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
