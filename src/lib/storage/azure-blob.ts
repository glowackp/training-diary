import type { SaveUploadInput } from "@/lib/storage/local";

/** Marks the Azure blob adapter as intentionally unimplemented during local-first setup. */
export class AzureBlobStorageAdapter {
  async saveUpload(
    input: SaveUploadInput,
  ): Promise<{
    path: string;
  }> {
    void input;
    throw new Error("Azure Blob Storage is not configured during Phase 0.");
  }
}
