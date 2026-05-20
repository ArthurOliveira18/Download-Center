import { NextResponse } from "next/server";
import { signInAdmin } from "@/lib/auth/server";

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries((await request.formData()).entries());

  const result = await signInAdmin({
    username: getPayloadText(payload, ["email", "username", "user"]),
    password: getPayloadText(payload, ["password", "senha"])
  });

  if (!result.ok) {
    const status = result.code === "config" ? 500 : 401;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}

function getPayloadText(payload, keys) {
  for (const key of keys) {
    const value = String(payload[key] || "").trim();

    if (value) {
      return value;
    }
  }

  return "";
}
