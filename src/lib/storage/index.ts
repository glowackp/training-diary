import { getServerConfig } from "@/lib/config/env";
import { AzureBlobStorageAdapter } from "@/lib/storage/azure-blob";
import { LocalStorageAdapter } from "@/lib/storage/local";
import type { StorageAdapter } from "@/lib/storage/types";

let storageAdapter: StorageAdapter | undefined;

/** Resolves the active storage adapter while keeping local development Azure-free. */
export function getStorageAdapter(): StorageAdapter {
  if (storageAdapter) {
    return storageAdapter;
  }

  const config = getServerConfig();

  const resolvedAdapter: StorageAdapter =
    config.storage.driver === "azure"
      ? new AzureBlobStorageAdapter()
      : new LocalStorageAdapter(config.storage.localUploadDirectory);

  storageAdapter = resolvedAdapter;

  return resolvedAdapter;
}

/** Clears the memoized adapter so tests can swap config safely between cases. */
export function resetStorageAdapterForTests() {
  storageAdapter = undefined;
}
