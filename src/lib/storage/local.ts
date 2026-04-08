import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type SaveUploadInput = {
  fileName: string;
  content: Buffer;
};

/** Stores uploaded files on the local filesystem for development and testing. */
export class LocalStorageAdapter {
  constructor(private readonly baseDirectory: string) {}

  async saveUpload({ fileName, content }: SaveUploadInput) {
    await mkdir(this.baseDirectory, { recursive: true });

    const storedName = `${crypto.randomUUID()}-${fileName}`;
    const storedPath = path.join(this.baseDirectory, storedName);

    await writeFile(storedPath, content);

    return {
      path: storedPath,
    };
  }
}
