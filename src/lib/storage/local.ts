import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SaveUploadInput, StorageAdapter, StoredUpload } from "@/lib/storage/types";

function sanitizePathSegment(segment: string) {
  const sanitized = segment
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized.length > 0 ? sanitized : "owner";
}

function sanitizeFileName(fileName: string) {
  const parsed = path.parse(fileName.trim());
  const baseName = parsed.name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const extension = parsed.ext.replace(/[^a-zA-Z0-9.]+/g, "");

  return `${baseName || "upload"}${extension}`;
}

function buildStoragePath(ownerId: string, fileName: string) {
  const dateSegment = new Date().toISOString().slice(0, 10);
  const storedFileName = `${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;

  // Persist a relative storage key so database rows remain portable across local machines and future adapters.
  return path.posix.join(sanitizePathSegment(ownerId), dateSegment, storedFileName);
}

/** Stores uploaded files on the local filesystem for development and testing. */
export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly baseDirectory: string) {}

  async saveUpload({
    ownerId,
    fileName,
    content,
  }: SaveUploadInput): Promise<StoredUpload> {
    const storagePath = buildStoragePath(ownerId, fileName);
    const absolutePath = path.join(this.baseDirectory, storagePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);

    return {
      storagePath,
      sizeInBytes: content.byteLength,
    };
  }
}
