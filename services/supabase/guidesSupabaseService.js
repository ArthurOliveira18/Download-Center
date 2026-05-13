import { getSupabaseAdminClient } from "@/services/supabase/adminClient";
import {
  mapAppGuideToSupabaseGuide,
  mapAppGuideTypeToDbType,
  mapSupabaseGuideToAppGuide
} from "@/services/supabase/mappers";

export async function getSupabaseGuides(type = "guide") {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("type", mapAppGuideTypeToDbType(type))
    .eq("active", true)
    .order("titulo", { ascending: true });

  assertSupabaseSuccess(error);
  return (data || []).map(mapSupabaseGuideToAppGuide);
}

export async function getAllSupabaseGuideContent() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("active", true)
    .order("titulo", { ascending: true });

  assertSupabaseSuccess(error);
  return (data || []).map(mapSupabaseGuideToAppGuide);
}

export async function findSupabaseGuideByIdOrSlug(idOrSlug, type) {
  const supabase = getSupabaseAdminClient();
  const value = String(idOrSlug || "").trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  let query = supabase.from("guides").select("*");

  query = isUuid ? query.or(`id.eq.${value},slug.eq.${value}`) : query.eq("slug", value);

  if (type) {
    query = query.eq("type", mapAppGuideTypeToDbType(type));
  }

  const { data, error } = await query.maybeSingle();
  assertSupabaseSuccess(error);
  return data ? mapSupabaseGuideToAppGuide(data) : null;
}

export async function createSupabaseGuide(guide, type = "guide") {
  const supabase = getSupabaseAdminClient();
  const payload = mapAppGuideToSupabaseGuide(guide, type);
  const { data, error } = await supabase
    .from("guides")
    .insert(payload)
    .select("*")
    .single();

  assertSupabaseSuccess(error);
  const appGuide = mapSupabaseGuideToAppGuide(data);
  await syncGuideResourceLinks(appGuide);
  return appGuide;
}

export async function updateSupabaseGuide(id, guide, type = "guide") {
  const supabase = getSupabaseAdminClient();
  const payload = mapAppGuideToSupabaseGuide({ ...guide, id }, type);
  const { data, error } = await supabase
    .from("guides")
    .update(payload)
    .eq("id", id)
    .eq("type", mapAppGuideTypeToDbType(type))
    .select("*")
    .single();

  assertSupabaseSuccess(error);
  const appGuide = mapSupabaseGuideToAppGuide(data);
  await syncGuideResourceLinks(appGuide);
  return appGuide;
}

export async function deleteSupabaseGuides(ids, type = "guide") {
  const safeIds = [...new Set((ids || []).map((id) => String(id || "").trim()).filter(Boolean))];

  if (!safeIds.length) {
    return 0;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("guides")
    .delete()
    .in("id", safeIds)
    .eq("type", mapAppGuideTypeToDbType(type));

  assertSupabaseSuccess(error);
  return safeIds.length;
}

async function syncGuideResourceLinks(guide) {
  if (!guide?.id) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const driverId = guide.driverRelacionadoId || "";
  const appId = guide.aplicativoRelacionadoId || "";

  const driverClearQuery = supabase.from("drivers").update({ guia_vinculado_id: null }).eq("guia_vinculado_id", guide.id);
  const appClearQuery = supabase.from("internal_apps").update({ guia_vinculado_id: null }).eq("guia_vinculado_id", guide.id);

  const { error: driverClearError } = driverId ? await driverClearQuery.neq("id", driverId) : await driverClearQuery;
  assertSupabaseSuccess(driverClearError);

  const { error: appClearError } = appId ? await appClearQuery.neq("id", appId) : await appClearQuery;
  assertSupabaseSuccess(appClearError);

  if (driverId) {
    const { error } = await supabase.from("drivers").update({ guia_vinculado_id: guide.id }).eq("id", driverId);
    assertSupabaseSuccess(error);
  }

  if (appId) {
    const { error } = await supabase.from("internal_apps").update({ guia_vinculado_id: guide.id }).eq("id", appId);
    assertSupabaseSuccess(error);
  }
}

function assertSupabaseSuccess(error) {
  if (error) {
    throw new Error(error.message);
  }
}
