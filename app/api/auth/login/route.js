import { NextResponse } from "next/server";
import { signInAdmin } from "@/lib/auth/server";

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries((await request.formData()).entries());

  const result = await signInAdmin({
    username: String(payload.username || payload.email || ""),
    password: String(payload.password || "")
  });

  if (!result.ok) {
    const status = result.error.includes("SECRET") ? 500 : 401;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
