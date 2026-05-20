export const allowedDownloadExtensions = [".zip", ".rar", ".7z", ".exe", ".msi"];
export const allowedDownloadAccept = allowedDownloadExtensions.join(",");
export const maxDownloadFileSizeBytes = 500 * 1024 * 1024;

export function validateDownloadFileMetadata({ fileName, fileSize }) {
  const safeName = String(fileName || "").trim();

  if (!safeName) {
    return {
      ok: false,
      error: "Selecione um arquivo."
    };
  }

  const size = Number(fileSize);

  if (!Number.isFinite(size) || size <= 0) {
    return {
      ok: false,
      error: "O arquivo selecionado esta vazio ou invalido."
    };
  }

  if (size > maxDownloadFileSizeBytes) {
    return {
      ok: false,
      error: `Arquivo muito grande. O limite e ${formatFileSize(maxDownloadFileSizeBytes)}.`
    };
  }

  const extension = getDownloadFileExtension(safeName);

  if (!allowedDownloadExtensions.includes(extension)) {
    return {
      ok: false,
      error: "Formato nao permitido. Use ZIP, RAR, 7Z, EXE ou MSI."
    };
  }

  return {
    ok: true,
    fileSizeBytes: size,
    fileSizeMb: bytesToMb(size),
    extension
  };
}

export function getDownloadFileExtension(fileName) {
  const cleanName = String(fileName || "").split(/[?#]/)[0].toLowerCase();
  const dotIndex = cleanName.lastIndexOf(".");

  return dotIndex >= 0 ? cleanName.slice(dotIndex) : "";
}

export function formatFileSize(bytes) {
  const size = Number(bytes) || 0;

  if (size >= 1024 * 1024) {
    return `${bytesToMb(size).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} bytes`;
}

export function bytesToMb(bytes) {
  return Number(bytes || 0) / (1024 * 1024);
}
