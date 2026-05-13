import { NextResponse } from "next/server";
import { getLinkedGuideOptions } from "@/services/linkedGuideService";

export async function GET() {
  return NextResponse.json({
    ok: true,
    items: await getLinkedGuideOptions()
  });
}
