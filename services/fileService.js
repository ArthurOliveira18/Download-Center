import fs from "node:fs";
import path from "node:path";

export function getPublicFileStatus(downloadUrl) {
  if (downloadUrl?.startsWith("/api/files/")) {
    return {
      checked: false,
      exists: true,
      publicPath: downloadUrl
    };
  }

  if (!downloadUrl || !downloadUrl.startsWith("/")) {
    return {
      checked: false,
      exists: Boolean(downloadUrl),
      publicPath: downloadUrl || ""
    };
  }

  const relativePath = decodeURIComponent(downloadUrl.replace(/^\/+/, ""));
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  return {
    checked: true,
    exists: fs.existsSync(absolutePath),
    publicPath: downloadUrl
  };
}

export function withDownloadStatus(item, downloadKey = "driver") {
  const download = item[downloadKey];
  const downloadUrl = download?.downloadUrl;

  return {
    ...item,
    arquivo: getPublicFileStatus(downloadUrl)
  };
}
