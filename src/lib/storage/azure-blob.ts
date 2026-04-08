import type { SaveUploadInput, StorageAdapter, StoredUpload } from "@/lib/storage/types";

/** Marks the Azure blob adapter as intentionally unimplemented during local-first setup. */
export class AzureBlobStorageAdapter implements StorageAdapter {
  async saveUpload(input: SaveUploadInput): Promise<StoredUpload> {
    void input;
    throw new Error(
      "Azure Blob Storage remains behind an interface and is not implemented for local-first development yet.",
    );
  }
}
