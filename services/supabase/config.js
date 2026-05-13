export const defaultStorageBucket = "download-center-files";

export function getSupabaseUrl() {
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");

  if (!url) {
    return "";
  }

  if (/\/rest\/v1\/?$/i.test(url)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL deve ser a URL base do projeto Supabase, sem /rest/v1.");
  }

  return url;
}

export function getSupabaseAnonKey() {
  return String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
}

export function getSupabaseServiceRoleKey() {
  return String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
}

export function getSupabaseStorageBucket() {
  return String(process.env.SUPABASE_STORAGE_BUCKET || defaultStorageBucket).trim() || defaultStorageBucket;
}

export function isSupabasePublicConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function isSupabaseAdminConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey() && getSupabaseServiceRoleKey());
}

export function getPublicSupabaseConfig() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return { anonKey, url };
}

export function getAdminSupabaseConfig() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!url || !serviceRoleKey) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no servidor.");
  }

  return { serviceRoleKey, url };
}
