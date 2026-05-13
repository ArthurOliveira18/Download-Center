import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/services/supabase/config";

let serverClient;

export function getSupabaseServerClient() {
  if (!serverClient) {
    const { anonKey, url } = getPublicSupabaseConfig();
    serverClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return serverClient;
}
