import path from "node:path";
import { getSupabaseAdminClient } from "@/services/supabase/adminClient";
import { getSupabaseStorageBucket } from "@/services/supabase/config";
import {
  bytesToMb,
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
  const bucketName = getSupabaseStorageBucket();
  const validation = validateDownloadFileMetadata({
    fileName: originalName,
    fileSize
  });

  console.info("[DownloadCenter upload] preparando upload", {
    bucket: bucketName,
    fileName: originalName,
    fileSizeBytes: Number(fileSize),
    fileSizeMb: bytesToMb(fileSize)
  });

  if (!validation.ok) {
    console.warn("[DownloadCenter upload] validacao bloqueou arquivo", {
      bucket: bucketName,
      fileName: originalName,
      fileSizeBytes: Number(fileSize),
      fileSizeMb: bytesToMb(fileSize),
      error: validation.error
    });
    return validation;
  }

  const uploadObject = buildDownloadStorageObject({
    folder,
    originalName,
    nameParts
  });
  const supabase = getSupabaseAdminClient();
  console.info("[DownloadCenter upload] path gerado para Supabase Storage", {
    bucket: bucketName,
    path: uploadObject.storagePath,
    fileSizeBytes: Number(fileSize),
    fileSizeMb: bytesToMb(fileSize)
  });
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUploadUrl(uploadObject.storagePath, {
      upsert: false
    });

  if (error || !data?.token) {
    console.error("[DownloadCenter upload] erro ao criar signed upload URL", {
      bucket: bucketName,
      path: uploadObject.storagePath,
      error
    });
    return {
      ok: false,
      error: error?.message || "Nao foi possivel preparar o envio do arquivo."
    };
  }

  return {
    ok: true,
    bucket: bucketName,
    contentType: contentType || "application/octet-stream",
    fileSizeBytes: Number(fileSize),
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

export async function deleteDownloadFile(storagePath) {
  const safePath = String(storagePath || "").trim();

  if (!safePath || safePath.includes("..")) {
    return {
      ok: false,
      error: "Arquivo invalido."
    };
  }

  const bucketName = getSupabaseStorageBucket();
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([safePath]);

  if (error) {
    console.error("[DownloadCenter upload] erro ao remover arquivo apos falha no cadastro", {
      bucket: bucketName,
      path: safePath,
      error
    });
    return {
      ok: false,
      error: error.message
    };
  }

  console.info("[DownloadCenter upload] arquivo removido apos falha no cadastro", {
    bucket: bucketName,
    path: safePath
  });

  return { ok: true };
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
