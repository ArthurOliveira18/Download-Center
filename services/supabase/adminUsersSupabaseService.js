import { getSupabaseAdminClient } from "@/services/supabase/adminClient";
import { isSupabaseAdminConfigured } from "@/services/supabase/config";

export async function getAdminUserByEmail(email) {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", String(email || "").trim().toLowerCase())
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data || null;
}

export async function listAdminUsers() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id,name,email,role,active,created_at,updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createAdminUser({ name, email, role = "viewer", active = true }) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      name,
      email: String(email || "").trim().toLowerCase(),
      role,
      active
    })
    .select("id,name,email,role,active,created_at,updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateAdminUser(id, values) {
  const supabase = getSupabaseAdminClient();
  const payload = {
    ...(values.name !== undefined ? { name: values.name } : {}),
    ...(values.email !== undefined ? { email: String(values.email).trim().toLowerCase() } : {}),
    ...(values.role !== undefined ? { role: values.role } : {}),
    ...(values.active !== undefined ? { active: Boolean(values.active) } : {})
  };
  const { data, error } = await supabase
    .from("admin_users")
    .update(payload)
    .eq("id", id)
    .select("id,name,email,role,active,created_at,updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
