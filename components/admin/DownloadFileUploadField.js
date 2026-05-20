"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/services/supabase/client";
import {
  allowedDownloadAccept,
  formatFileSize,
  maxDownloadFileSizeBytes,
  validateDownloadFileMetadata
} from "@/services/uploads/downloadFilePolicy";
import styles from "./DownloadFileUploadField.module.css";

const hiddenFieldNames = {
  downloadUrl: "uploadedDownloadUrl",
  fileName: "uploadedFileName",
  fileSize: "uploadedFileSize",
  localPath: "uploadedLocalPath",
  originalName: "uploadedOriginalName",
  storagePath: "uploadedStoragePath"
};

export function DownloadFileUploadField({
  directUpload = false,
  folder,
  label,
  localUpload = false,
  namePartFields = []
}) {
  const inputRef = useRef(null);
  const readyToSubmitRef = useRef(false);
  const uploadedSignatureRef = useRef("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const namePartFieldsKey = namePartFields.join("|");
  const canUpload = directUpload || localUpload;
  const storageUnavailable = !canUpload;

  useEffect(() => {
    const input = inputRef.current;
    const form = input?.form;

    if (!canUpload || !input || !form) {
      return undefined;
    }

    async function handleSubmit(event) {
      if (readyToSubmitRef.current) {
        readyToSubmitRef.current = false;
        return;
      }

      const file = input.files?.[0];
      const signature = getFileSignature(file);

      if (!file) {
        const message = "Selecione um arquivo antes de salvar.";
        setError(message);
        setStatus("");
        stopSubmitWithError(event, input, message);
        return;
      }

      const validation = validateDownloadFileMetadata({
        fileName: file.name,
        fileSize: file.size
      });

      if (!validation.ok) {
        setError(validation.error);
        setStatus("");
        stopSubmitWithError(event, input, validation.error);
        return;
      }

      const hasUploadedReference =
        getHiddenValue(form, hiddenFieldNames.storagePath) || getHiddenValue(form, hiddenFieldNames.localPath);

      if (signature && signature === uploadedSignatureRef.current && hasUploadedReference) {
        clearInputError(input);
        setError("");
        setStatus("");
        return;
      }

      event.preventDefault();
      clearInputError(input);
      clearHiddenFields(form);
      setError("");
      setStatus("Enviando arquivo para o storage...");
      setUploading(true);

      try {
        const upload = directUpload
          ? await uploadToSupabaseStorage(form, file, folder, namePartFieldsKey.split("|").filter(Boolean))
          : await uploadToLocalStorage(form, file, folder, namePartFieldsKey.split("|").filter(Boolean));

        if (upload.storagePath) {
          setHiddenValue(form, hiddenFieldNames.storagePath, upload.storagePath);
        }

        if (upload.localPath) {
          setHiddenValue(form, hiddenFieldNames.localPath, upload.localPath);
        }

        setHiddenValue(form, hiddenFieldNames.downloadUrl, upload.downloadUrl);
        setHiddenValue(form, hiddenFieldNames.originalName, upload.originalName || file.name);
        setHiddenValue(form, hiddenFieldNames.fileName, upload.fileName);
        setHiddenValue(form, hiddenFieldNames.fileSize, String(file.size));
        uploadedSignatureRef.current = signature;
        setStatus("Arquivo enviado. Salvando cadastro...");
        readyToSubmitRef.current = true;
        requestFormSubmit(form, event.submitter);
      } catch (uploadError) {
        const friendlyMessage = getFriendlyUploadError(uploadError);
        setError(friendlyMessage);
        setStatus("");
        clearInputError(input);
        setUploading(false);
      }
    }

    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, [canUpload, directUpload, folder, namePartFieldsKey]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    clearHiddenFields(event.target.form);
    uploadedSignatureRef.current = "";
    setStatus("");

    if (!file) {
      clearInputError(event.target);
      setError("");
      return;
    }

    const validation = validateDownloadFileMetadata({
      fileName: file.name,
      fileSize: file.size
    });

    if (!validation.ok) {
      event.target.setCustomValidity(validation.error);
      setError(validation.error);
      return;
    }

    clearInputError(event.target);
    setError("");
  }

  return (
    <label className={styles.uploadField}>
      <span>{label}</span>
      <input
        accept={allowedDownloadAccept}
        className={styles.fileInput}
        disabled={uploading || storageUnavailable}
        onChange={handleFileChange}
        ref={inputRef}
        required
        type="file"
      />
      <input name={hiddenFieldNames.storagePath} type="hidden" />
      <input name={hiddenFieldNames.localPath} type="hidden" />
      <input name={hiddenFieldNames.downloadUrl} type="hidden" />
      <input name={hiddenFieldNames.originalName} type="hidden" />
      <input name={hiddenFieldNames.fileName} type="hidden" />
      <input name={hiddenFieldNames.fileSize} type="hidden" />
      {error ? (
        <small className={styles.error}>{error}</small>
      ) : (
        <small className={styles.hint}>
          {storageUnavailable
            ? "Configure o Supabase Storage para enviar arquivos neste ambiente."
            : directUpload
            ? `O arquivo vai direto para o Supabase Storage. Limite: ${formatFileSize(maxDownloadFileSizeBytes)}.`
            : `Limite: ${formatFileSize(maxDownloadFileSizeBytes)}.`}
        </small>
      )}
      {status ? <small className={styles.status}>{status}</small> : null}
    </label>
  );
}

async function uploadToSupabaseStorage(form, file, folder, namePartFields) {
  const upload = await prepareSupabaseUpload(form, file, folder, namePartFields);
  const supabase = getSupabaseBrowserClient();
  const { error: uploadError } = await supabase.storage
    .from(upload.bucket)
    .uploadToSignedUrl(upload.storagePath, upload.token, file, {
      contentType: upload.contentType || file.type || "application/octet-stream"
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  return upload;
}

async function prepareSupabaseUpload(form, file, folder, namePartFields) {
  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contentType: file.type || "application/octet-stream",
      fileName: file.name,
      fileSize: file.size,
      folder,
      nameParts: getNameParts(form, namePartFields)
    })
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || "Nao foi possivel preparar o upload.");
  }

  return result;
}

async function uploadToLocalStorage(form, file, folder, namePartFields) {
  const formData = new FormData();
  const fieldValues = getNamePartValues(form, namePartFields);

  formData.set("arquivo", file);
  formData.set("folder", folder);

  Object.entries(fieldValues).forEach(([key, value]) => {
    formData.set(key, value);
  });

  const response = await fetch("/api/admin/uploads/local", {
    method: "POST",
    body: formData
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || "Nao foi possivel enviar o arquivo.");
  }

  return result;
}

function getNameParts(form, fields) {
  return Object.values(getNamePartValues(form, fields)).filter(Boolean);
}

function getNamePartValues(form, fields) {
  const formData = new FormData(form);

  return Object.fromEntries(
    fields.map((field) => [field, String(formData.get(field) || "").trim()])
  );
}

function stopSubmitWithError(event, input, message) {
  event.preventDefault();
  input.setCustomValidity(message);
  input.reportValidity();
  setTimeout(() => input.setCustomValidity(message), 0);
}

function clearInputError(input) {
  input.setCustomValidity("");
}

function getFriendlyUploadError(error) {
  const message = error?.message || "";

  if (/size|large|too big|limite|grande/i.test(message)) {
    return `Arquivo muito grande. O limite e ${formatFileSize(maxDownloadFileSizeBytes)}.`;
  }

  if (/session|unauthorized|401|403|auth/i.test(message)) {
    return "Sua sessao administrativa expirou. Entre novamente para enviar o arquivo.";
  }

  return message || "Nao foi possivel enviar o arquivo. Tente novamente.";
}

function requestFormSubmit(form, submitter) {
  if (submitter && typeof form.requestSubmit === "function") {
    form.requestSubmit(submitter);
    return;
  }

  form.requestSubmit();
}

function getFileSignature(file) {
  if (!file) {
    return "";
  }

  return [file.name, file.size, file.lastModified].join(":");
}

function clearHiddenFields(form) {
  if (!form) {
    return;
  }

  Object.values(hiddenFieldNames).forEach((name) => setHiddenValue(form, name, ""));
}

function setHiddenValue(form, name, value) {
  const field = form.elements.namedItem(name);

  if (field) {
    field.value = value;
  }
}

function getHiddenValue(form, name) {
  return form.elements.namedItem(name)?.value || "";
}
