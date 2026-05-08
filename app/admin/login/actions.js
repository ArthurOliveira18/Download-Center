"use server";

import { redirect } from "next/navigation";
import { signInAdmin } from "@/lib/auth/server";

export async function loginAction(formData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const result = await signInAdmin({ username, password });

  if (!result.ok) {
    const errorCode = result.error.includes("AUTH_SECRET") ? "config" : "invalid";
    redirect(`/admin/login?error=${errorCode}`);
  }

  const from = String(formData.get("from") || "/admin");
  redirect(from.startsWith("/admin") ? from : "/admin");
}
