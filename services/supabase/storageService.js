import path from "node:path";
import { getSupabaseAdminClient } from "@/services/supabase/adminClient";
import { getSupabaseStorageBucket } from "@/services/supabase/config";
import { sanitizeFileName, slugify } from "@/utils/slug";

const allowedDownloadExtensions = new Set([".zip", ".rar", ".7z", ".exe", ".msi"]);

export function buildStorageDownloadUrl(storagePath = "") {
  const safePath = String(storagePath || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return safePath ? `/api/files/${safePath}` : "";
}

export async function uploadDownloadFile({ file, folder, nameParts = [] }) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return {
      ok: false,
      error: "Selecione um arquivo."
    };
  }

  const originalName = sanitizeFileName(file.name || "arquivo.zip");
  const extension = path.extname(originalName).toLowerCase();

  if (!allowedDownloadExtensions.has(extension)) {
    return {
      ok: false,
      error: "Formato nao permitido. Use ZIP, RAR, 7Z, EXE ou MSI."
    };
  }

  await ensureDownloadBucket();

  const folderSlug = slugify(folder || "downloads");
  const baseName = nameParts.map((part) => slugify(part)).filter(Boolean).join("-");
  const timestamp = Date.now();
  const fileName = `${baseName || path.basename(originalName, extension)}-${timestamp}${extension}`;
  const storagePath = `${folderSlug}/${fileName}`;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(getSupabaseStorageBucket())
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (error) {
    return {
      ok: false,
      error: `Falha ao enviar arquivo para o Supabase Storage: ${error.message}`
    };
  }

  return {
    ok: true,
    originalName,
    fileName,
    storagePath,
    downloadUrl: buildStorageDownloadUrl(storagePath)
  };
}

export async function createSignedDownloadUrl(storagePath) {
  const safePath = String(storagePath || "").trim();

  if (!safePath || safePath.includes("..")) {
    return {
      ok: false,
      error: "Arquivo invalido."
    };
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(getSupabaseStorageBucket())
    .createSignedUrl(safePath, 60, { download: true });

  if (error || !data?.signedUrl) {
    return {
      ok: false,
      error: error?.message || "Nao foi possivel gerar o link de download."
    };
  }

  return {
    ok: true,
    signedUrl: data.signedUrl
  };
}

export async function ensureDownloadBucket() {
  const bucketName = getSupabaseStorageBucket();
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.storage.getBucket(bucketName);

  if (data) {
    return data;
  }

  const { data: createdBucket, error } = await supabase.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: 1024 * 1024 * 500,
    allowedMimeTypes: [
      "application/zip",
      "application/x-zip-compressed",
      "application/vnd.rar",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      "application/octet-stream",
      "application/x-msdownload",
      "application/x-msi"
    ]
  });

  if (error) {
    throw new Error(`Nao foi possivel criar o bucket ${bucketName}: ${error.message}`);
  }

  return createdBucket;
}
