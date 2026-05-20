"use server";

import { redirect } from "next/navigation";
import { signInAdmin } from "@/lib/auth/server";

export async function loginAction(formData) {
  const username = getFormText(formData, ["email", "username", "user"]);
  const password = getFormText(formData, ["password", "senha"]);
  const result = await signInAdmin({ username, password });

  if (!result.ok) {
    const errorCode = result.code === "config" ? "config" : "invalid";
    redirect(`/admin/login?error=${errorCode}`);
  }

  const from = String(formData.get("from") || "/admin");
  redirect(from.startsWith("/admin") ? from : "/admin");
}

function getFormText(formData, keys) {
  for (const key of keys) {
    const value = String(formData.get(key) || "").trim();

    if (value) {
      return value;
    }
  }

  return "";
}
