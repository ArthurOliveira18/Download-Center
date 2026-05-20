import fs from "node:fs/promises";
import path from "node:path";
import { validateDownloadFileMetadata } from "@/services/uploads/downloadFilePolicy";
import { sanitizeFileName, slugify } from "@/utils/slug";

export async function saveDriverFile({ file, marca, modelo, versao }) {
  if (process.env.VERCEL) {
    return {
      ok: false,
      error:
        "Upload local nao esta disponivel na Vercel. Configure um adaptador de storage como GitHub, S3, Firebase, Cloudinary ou outro bucket."
    };
  }

  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return {
      ok: false,
      error: "Selecione o arquivo do driver."
    };
  }

  const originalName = sanitizeFileName(file.name || "driver.zip");
  const validation = validateDownloadFileMetadata({
    fileName: originalName,
    fileSize: file.size
  });

  if (!validation.ok) {
    return validation;
  }

  const extension = path.extname(originalName).toLowerCase();
  const brandSlug = slugify(marca);
  const modelSlug = slugify(modelo);
  const versionSlug = versao ? slugify(versao) : "driver";
  const fileName = `${modelSlug}-${versionSlug}${extension}`;
  const relativeFolder = path.join("drivers", brandSlug);
  const publicFolder = path.join(process.cwd(), "public", relativeFolder);
  const absolutePath = path.join(publicFolder, fileName);
  const downloadUrl = `/${relativeFolder.replace(/\\/g, "/")}/${fileName}`;

  await fs.mkdir(publicFolder, { recursive: true });
  await fs.writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  return {
    ok: true,
    originalName,
    fileName,
    fileSizeBytes: file.size,
    fileType: file.type || "application/octet-stream",
    absolutePath,
    downloadUrl,
    localPath: absolutePath.replace(/\\/g, "/")
  };
}

export async function saveInternalAppFile({ file, nome, versao }) {
  if (process.env.VERCEL) {
    return {
      ok: false,
      error:
        "Upload local nao esta disponivel na Vercel. Configure o Supabase Storage para arquivos de aplicativos."
    };
  }

  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return {
      ok: false,
      error: "Selecione o arquivo do aplicativo."
    };
  }

  const originalName = sanitizeFileName(file.name || "aplicativo.zip");
  const validation = validateDownloadFileMetadata({
    fileName: originalName,
    fileSize: file.size
  });

  if (!validation.ok) {
    return validation;
  }

  const extension = path.extname(originalName).toLowerCase();
  const appSlug = slugify(nome);
  const versionSlug = versao ? slugify(versao) : "app";
  const fileName = `${appSlug}-${versionSlug}${extension}`;
  const relativeFolder = path.join("apps", appSlug);
  const publicFolder = path.join(process.cwd(), "public", relativeFolder);
  const absolutePath = path.join(publicFolder, fileName);
  const downloadUrl = `/${relativeFolder.replace(/\\/g, "/")}/${fileName}`;

  await fs.mkdir(publicFolder, { recursive: true });
  await fs.writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  return {
    ok: true,
    originalName,
    fileName,
    fileSizeBytes: file.size,
    fileType: file.type || "application/octet-stream",
    absolutePath,
    downloadUrl,
    localPath: absolutePath.replace(/\\/g, "/")
  };
}
