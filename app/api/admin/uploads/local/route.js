import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/server";
import { saveDriverFile, saveInternalAppFile } from "@/services/storage/localDriverStorage";

export async function POST(request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ ok: false, error: "Sessao administrativa expirada." }, { status: 401 });
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      { ok: false, error: "Configure o Supabase Storage para cadastrar arquivos na Vercel." },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const folder = getText(formData, "folder");
  const file = formData.get("arquivo");
  const result =
    folder === "drivers"
      ? await saveDriverFile({
          file,
          marca: getText(formData, "marca"),
          modelo: getText(formData, "modelo"),
          versao: getText(formData, "versao")
        })
      : folder === "apps"
      ? await saveInternalAppFile({
          file,
          nome: getText(formData, "nome"),
          versao: getText(formData, "versao")
        })
      : { ok: false, error: "Tipo de upload invalido." };

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

function getText(formData, key) {
  return String(formData.get(key) || "").trim();
}
