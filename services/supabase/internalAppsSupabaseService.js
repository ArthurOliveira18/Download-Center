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

  assertSupabaseSuccess(error);
  return mapSupabaseInternalAppToAppInternalApp(data);
}

export async function updateSupabaseInternalApp(id, app) {
  const supabase = getSupabaseAdminClient();
  const payload = mapAppInternalAppToSupabaseInternalApp(app);
  delete payload.download_url;
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

export async function deleteSupabaseInternalApp() {
  return {
    ok: false,
    error: "Aplicativos internos nao podem ser excluidos."
  };
}

function assertSupabaseSuccess(error) {
  if (error) {
    throw new Error(error.message);
  }
}
