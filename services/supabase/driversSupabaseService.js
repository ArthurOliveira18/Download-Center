import { getSupabaseAdminClient } from "@/services/supabase/adminClient";
import {
  mapAppDriverToSupabaseDriver,
  mapSupabaseDriverToAppDriver
} from "@/services/supabase/mappers";
import { normalizeText } from "@/utils/search";

const driverSelect = `
  *,
  guia:guides!drivers_guia_vinculado_id_fkey (
    id,
    titulo,
    slug,
    type,
    passos
  )
`;

export async function getSupabaseDrivers() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("drivers")
    .select(driverSelect)
    .order("marca", { ascending: true })
    .order("modelo", { ascending: true });

  assertSupabaseSuccess(error);
  return (data || []).map(mapSupabaseDriverToAppDriver);
}

export async function findSupabaseDriverById(id) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("drivers")
    .select(driverSelect)
    .eq("id", id)
    .maybeSingle();

  assertSupabaseSuccess(error);
  return data ? mapSupabaseDriverToAppDriver(data) : null;
}

export async function findSupabaseDriverDuplicate({ marca, modelo }) {
  const drivers = await getSupabaseDrivers();
  return drivers.find((driver) => {
    return normalizeText(driver.marca) === normalizeText(marca) && normalizeText(driver.modelo) === normalizeText(modelo);
  });
}

export async function createSupabaseDriver(driver) {
  const supabase = getSupabaseAdminClient();
  const payload = mapAppDriverToSupabaseDriver(driver);
  assertValidDriverInsertPayload(payload);

  const { data, error } = await supabase
    .from("drivers")
    .insert(payload)
    .select(driverSelect)
    .single();

  assertSupabaseSuccess(error, { action: "createSupabaseDriver", payload });
  return mapSupabaseDriverToAppDriver(data);
}

export async function updateSupabaseDriver(id, driver) {
  const supabase = getSupabaseAdminClient();
  const payload = mapAppDriverToSupabaseDriver(driver);
  delete payload.marca;
  delete payload.modelo;
  delete payload.download_url;
  delete payload.storage_path;

  const { data, error } = await supabase
    .from("drivers")
    .update(payload)
    .eq("id", id)
    .select(driverSelect)
    .single();

  assertSupabaseSuccess(error);
  return mapSupabaseDriverToAppDriver(data);
}

export async function deleteSupabaseDriver(id) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("drivers")
    .delete()
    .eq("id", id);

  assertSupabaseSuccess(error);
  return true;
}

function assertSupabaseSuccess(error, context = {}) {
  if (error) {
    console.error("[DownloadCenter driver] erro no banco Supabase", {
      action: context.action || "unknown",
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
      payload: context.payload || null
    });
    throw new Error(error.message);
  }
}

function assertValidDriverInsertPayload(payload) {
  const allowedColumns = new Set([
    "marca",
    "modelo",
    "categoria",
    "descricao",
    "compatibilidade",
    "keywords",
    "destaque",
    "driver_nome",
    "driver_versao",
    "download_url",
    "storage_path",
    "guia_vinculado_id"
  ]);
  const invalidColumns = Object.keys(payload).filter((key) => !allowedColumns.has(key));

  if (invalidColumns.length) {
    throw new Error(`Payload de drivers contem colunas invalidas: ${invalidColumns.join(", ")}`);
  }

  if (!payload.marca || !payload.modelo) {
    throw new Error("Marca e modelo sao obrigatorios para cadastrar o driver.");
  }

  if (!Array.isArray(payload.compatibilidade) || !Array.isArray(payload.keywords)) {
    throw new Error("Compatibilidade e keywords devem ser arrays JSON.");
  }
}
