// This module keeps storage rules separate from screen rendering.
export const BUCKET = "learning-documents";
export const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function validateFile(file) {
  if (!file) throw new Error("Choose a sample file first.");
  if (!TYPES.has(file.type)) throw new Error("Choose a PDF, JPEG or PNG file.");
  if (file.size === 0) throw new Error("Empty files cannot be uploaded.");
  if (file.size > MAX_BYTES)
    throw new Error("The file must be 5 MiB or smaller.");
}

export function objectPath(userId, fileName, uniqueId = crypto.randomUUID()) {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error("Invalid account ID.");
  const safeName =
    fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "document";
  return `${userId}/${uniqueId}--${safeName}`;
}

export function displayName(objectName) {
  const separator = objectName.indexOf("--");
  return separator < 0 ? objectName : objectName.slice(separator + 2);
}

export async function uploadDocument(client, userId, file) {
  validateFile(file);
  const path = objectPath(userId, file.name);
  // Never overwrite: every submission gets its own unique object name.
  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function listDocuments(client, userId) {
  const files = [];
  // A list call is paginated. Read all pages rather than hiding older uploads.
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await client.storage.from(BUCKET).list(userId, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!Array.isArray(data))
      throw new Error("Could not read the document list.");
    files.push(...data.filter((file) => file.id));
    if (data.length < 100) return files;
  }
}

export async function downloadDocument(client, path) {
  // The authenticated download is checked by Storage policies, not a public URL.
  const { data, error } = await client.storage.from(BUCKET).download(path);
  if (error) throw error;
  return data;
}

export async function deleteDocument(client, path) {
  const { error } = await client.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
