import { NextResponse } from "next/server";
import { createSignedDownloadUrl } from "@/services/supabase/storageService";

export async function GET(_request, context) {
  const params = await context.params;
  const storagePath = (params.path || []).join("/");

  if (!storagePath || storagePath.includes("..")) {
    return NextResponse.json({ ok: false, error: "Arquivo invalido." }, { status: 400 });
  }

  const result = await createSignedDownloadUrl(storagePath);

  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.redirect(result.signedUrl);
}
