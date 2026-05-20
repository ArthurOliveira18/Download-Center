import { getSupabaseAdminClient } from "@/services/supabase/adminClient";
import {
  mapAppInternalAppToSupabaseInternalApp,
  mapSupabaseInternalAppToAppInternalApp
} from "@/services/supabase/mappers";
import { normalizeText } from "@/utils/search";

const appSelect = `
  *,
  guia:guides!internal_apps_guia_vinculado_id_fkey (
    id,
    titulo,
    slug,
    type,
    passos
  )
`;

export async function getSupabaseInternalApps() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("internal_apps")
    .select(appSelect)
    .eq("active", true)
    .order("nome", { ascending: true });

  assertSupabaseSuccess(error);
  return (data || []).map(mapSupabaseInternalAppToAppInternalApp);
}

export async function findSupabaseInternalAppById(id) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("internal_apps")
    .select(appSelect)
    .eq("id", id)
    .maybeSingle();

  assertSupabaseSuccess(error);
  return data ? mapSupabaseInternalAppToAppInternalApp(data) : null;
}

export async function findSupabaseInternalAppDuplicate({ nome }) {
  const apps = await getSupabaseInternalApps();
  return apps.find((app) => normalizeText(app.nome) === normalizeText(nome));
}

export async function createSupabaseInternalApp(app) {
  const supabase = getSupabaseAdminClient();
  const payload = mapAppInternalAppToSupabaseInternalApp(app);
  const { data, error } = await supabase
    .from("internal_apps")
    .insert(payload)
    .select(appSelect)
    .single();

  assertSupabaseSuccess(error, { action: "createSupabaseInternalApp", payload });
  return mapSupabaseInternalAppToAppInternalApp(data);
}

export async function updateSupabaseInternalApp(id, app) {
  const supabase = getSupabaseAdminClient();
  const payload = mapAppInternalAppToSupabaseInternalApp(app);
  delete payload.download_url;
  delete payload.file_name;
  delete payload.file_size_bytes;
  delete payload.file_type;
  delete payload.storage_path;

  const { data, error } = await supabase
    .from("internal_apps")
    .update(payload)
    .eq("id", id)
    .select(appSelect)
    .single();

  assertSupabaseSuccess(error);
  return mapSupabaseInternalAppToAppInternalApp(data);
}

export async function deleteSupabaseInternalApp(id) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("internal_apps")
    .delete()
    .eq("id", id);

  assertSupabaseSuccess(error);
  return true;
}

function assertSupabaseSuccess(error, context = {}) {
  if (error) {
    console.error("[DownloadCenter app] erro no banco Supabase", {
      action: context.action || "unknown",
      error,
      payloadKeys: context.payload ? Object.keys(context.payload) : []
    });
    throw new Error(error.message);
  }
}
