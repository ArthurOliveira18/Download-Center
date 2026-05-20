import path from "node:path";
import { getSupabaseAdminClient } from "@/services/supabase/adminClient";
import { getSupabaseStorageBucket } from "@/services/supabase/config";
import {
  bytesToMb,
  maxDownloadFileSizeBytes,
  validateDownloadFileMetadata
} from "@/services/uploads/downloadFilePolicy";
import { sanitizeFileName, slugify } from "@/utils/slug";

const allowedUploadFolders = new Set(["apps", "drivers"]);
const allowedMimeTypes = [
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.rar",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/octet-stream",
  "application/x-msdownload",
  "application/x-msi"
];

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

  await ensureDownloadBucket();

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

export async function ensureDownloadBucket() {
  const bucketName = getSupabaseStorageBucket();
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.storage.getBucket(bucketName);

  if (data) {
    const currentLimit = Number(data.file_size_limit || data.fileSizeLimit || 0);
    const needsLimitUpdate = !currentLimit || currentLimit < maxDownloadFileSizeBytes;

    if (needsLimitUpdate) {
      const { error } = await supabase.storage.updateBucket(bucketName, {
        public: false,
        fileSizeLimit: maxDownloadFileSizeBytes,
        allowedMimeTypes
      });

      if (error) {
        console.error("[DownloadCenter upload] erro ao atualizar limite do bucket", {
          bucket: bucketName,
          currentLimitBytes: currentLimit || null,
          targetLimitBytes: maxDownloadFileSizeBytes,
          error
        });
        throw new Error(
          `Nao foi possivel ajustar o limite do bucket ${bucketName} para 500 MB. Verifique o limite global do Supabase Storage e o plano do projeto.`
        );
      }

      console.info("[DownloadCenter upload] bucket atualizado", {
        bucket: bucketName,
        previousLimitBytes: currentLimit || null,
        targetLimitBytes: maxDownloadFileSizeBytes
      });
    } else {
      console.info("[DownloadCenter upload] bucket configurado", {
        bucket: bucketName,
        fileSizeLimitBytes: currentLimit
      });
    }

    return data;
  }

  const { data: createdBucket, error } = await supabase.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: maxDownloadFileSizeBytes,
    allowedMimeTypes
  });

  if (error) {
    console.error("[DownloadCenter upload] erro ao criar bucket", {
      bucket: bucketName,
      targetLimitBytes: maxDownloadFileSizeBytes,
      error
    });
    throw new Error(`Nao foi possivel criar o bucket ${bucketName}: ${error.message}`);
  }

  console.info("[DownloadCenter upload] bucket criado", {
    bucket: bucketName,
    fileSizeLimitBytes: maxDownloadFileSizeBytes
  });

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
