import type { OwnerId } from "@/types/owner";

export type SaveUploadInput = {
  ownerId: OwnerId;
  fileName: string;
  contentType?: string | null;
  content: Buffer;
};

export type StoredUpload = {
  storagePath: string;
  sizeInBytes: number;
};

export type StorageAdapter = {
  saveUpload(input: SaveUploadInput): Promise<StoredUpload>;
};
