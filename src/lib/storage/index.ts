import { getServerEnv } from "@/lib/config/env";
import { AzureBlobStorageAdapter } from "@/lib/storage/azure-blob";
import { LocalStorageAdapter, type SaveUploadInput } from "@/lib/storage/local";

export type StorageAdapter = {
  saveUpload(input: SaveUploadInput): Promise<{
    path: string;
  }>;
};

let storageAdapter: StorageAdapter | undefined;

/** Resolves the active storage adapter while keeping local development Azure-free. */
export function getStorageAdapter(): StorageAdapter {
  if (storageAdapter) {
    return storageAdapter;
  }

  const env = getServerEnv();

  const resolvedAdapter: StorageAdapter =
    env.STORAGE_DRIVER === "azure"
      ? new AzureBlobStorageAdapter()
      : new LocalStorageAdapter(env.LOCAL_UPLOAD_DIR);

  storageAdapter = resolvedAdapter;

  return resolvedAdapter;
}
