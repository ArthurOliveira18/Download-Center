import path from "node:path";
import { getSupabaseAdminClient } from "@/services/supabase/adminClient";
import { getSupabaseStorageBucket } from "@/services/supabase/config";
import {
  maxDownloadFileSizeBytes,
  validateDownloadFileMetadata
} from "@/services/uploads/downloadFilePolicy";
import { sanitizeFileName, slugify } from "@/utils/slug";

const allowedUploadFolders = new Set(["apps", "drivers"]);

export function buildStorageDownloadUrl(storagePath = "") {
  const safePath = String(storagePath || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return safePath ? `/api/files/${safePath}` : "";
}

export async function createSignedDownloadUpload({ contentType, fileName, fileSize, folder, nameParts = [] }) {
  if (!allowedUploadFolders.has(folder)) {
    return {
      ok: false,
      error: "Tipo de upload invalido."
    };
  }

  const originalName = sanitizeFileName(fileName || "arquivo.zip");
  const validation = validateDownloadFileMetadata({
    fileName: originalName,
    fileSize
  });

  if (!validation.ok) {
    return validation;
  }

  await ensureDownloadBucket();

  const uploadObject = buildDownloadStorageObject({
    folder,
    originalName,
    nameParts
  });
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(getSupabaseStorageBucket())
    .createSignedUploadUrl(uploadObject.storagePath, {
      upsert: false
    });

  if (error || !data?.token) {
    return {
      ok: false,
      error: error?.message || "Nao foi possivel preparar o envio do arquivo."
    };
  }

  return {
    ok: true,
    bucket: getSupabaseStorageBucket(),
    contentType: contentType || "application/octet-stream",
    originalName,
    ...uploadObject,
    token: data.token,
    signedUrl: data.signedUrl || "",
    downloadUrl: buildStorageDownloadUrl(uploadObject.storagePath)
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
    fileSizeLimit: maxDownloadFileSizeBytes,
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

function buildDownloadStorageObject({ folder, originalName, nameParts = [] }) {
  const extension = path.extname(originalName).toLowerCase();
  const folderSlug = slugify(folder || "downloads");
  const baseName = nameParts.map((part) => slugify(part)).filter(Boolean).join("-");
  const timestamp = Date.now();
  const fallbackName = path.basename(originalName, extension);
  const fileName = `${baseName || fallbackName}-${timestamp}${extension}`;

  return {
    fileName,
    storagePath: `${folderSlug}/${fileName}`
  };
}
