import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/server";

export async function GET() {
  const admin = await getCurrentAdmin();

  return NextResponse.json({
    ok: true,
    authenticated: Boolean(admin),
    admin
  });
}
