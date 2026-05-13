import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/services/supabase/config";

let browserClient;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { anonKey, url } = getPublicSupabaseConfig();
    browserClient = createClient(url, anonKey);
  }

  return browserClient;
}
