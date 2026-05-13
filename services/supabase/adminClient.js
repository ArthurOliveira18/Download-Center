import { createClient } from "@supabase/supabase-js";
import { getAdminSupabaseConfig } from "@/services/supabase/config";

let adminClient;

export function getSupabaseAdminClient() {
  if (!adminClient) {
    const { serviceRoleKey, url } = getAdminSupabaseConfig();
    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return adminClient;
}
