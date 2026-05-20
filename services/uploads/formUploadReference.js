import { buildStorageDownloadUrl } from "@/services/supabase/storageService";
import { validateDownloadFileMetadata } from "@/services/uploads/downloadFilePolicy";

export function getUploadedDownloadReferenceFromForm(formData, { folder, requiredMessage }) {
  const storagePath = getText(formData, "uploadedStoragePath");
  const downloadUrl = getText(formData, "uploadedDownloadUrl");
  const originalName = getText(formData, "uploadedOriginalName") || getText(formData, "uploadedFileName");
  const fileName = getText(formData, "uploadedFileName") || getFileNameFromStoragePath(storagePath);
  const fileSize = Number(getText(formData, "uploadedFileSize"));
  const fileType = getText(formData, "uploadedFileType") || "application/octet-stream";

  if (!downloadUrl || !storagePath) {
    return {
      ok: false,
      error: requiredMessage || "Envie o arquivo antes de salvar."
    };
  }

  if (storagePath && (storagePath.includes("..") || storagePath.startsWith("/") || storagePath.startsWith("\\"))) {
    return {
      ok: false,
      error: "Referencia de arquivo invalida."
    };
  }

  if (storagePath && folder && !storagePath.startsWith(`${folder}/`)) {
    return {
      ok: false,
      error: "O arquivo enviado nao pertence ao tipo de cadastro selecionado."
    };
  }

  const validation = validateDownloadFileMetadata({
    fileName: originalName || fileName,
    fileSize
  });

  if (!validation.ok) {
    return validation;
  }

  const expectedDownloadUrl = buildStorageDownloadUrl(storagePath);

  if (downloadUrl !== expectedDownloadUrl) {
    return {
      ok: false,
      error: "Referencia de download invalida."
    };
  }

  return {
    ok: true,
    originalName,
    fileName,
    fileSizeBytes: fileSize,
    fileType,
    storagePath,
    downloadUrl
  };
}

function getText(formData, key) {
  return String(formData.get(key) || "").trim();
}

function getFileNameFromStoragePath(storagePath) {
  const parts = String(storagePath || "").split("/");

  return parts[parts.length - 1] || "";
}
