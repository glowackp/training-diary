import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LocalStorageAdapter } from "@/lib/storage/local";

describe("LocalStorageAdapter", () => {
  it("stores uploads under owner-scoped relative paths", async () => {
    const baseDirectory = await mkdtemp(path.join(os.tmpdir(), "training-diary-"));
    const adapter = new LocalStorageAdapter(baseDirectory);
    const upload = await adapter.saveUpload({
      ownerId: "owner-123",
      fileName: "Morning Ride?.fit",
      content: Buffer.from("fit-data"),
    });

    expect(upload.storagePath).toMatch(
      /^owner-123\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]+-Morning-Ride\.fit$/,
    );
    expect(upload.sizeInBytes).toBe(8);
    expect(path.isAbsolute(upload.storagePath)).toBe(false);
    expect(
      await readFile(path.join(baseDirectory, upload.storagePath), "utf8"),
    ).toBe("fit-data");
  });
});
