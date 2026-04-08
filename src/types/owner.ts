/** Owner identifiers stay as plain strings until a dedicated users table exists. */
export type OwnerId = string;

/** Use this reference shape for owner-scoped reads and writes to avoid cross-owner access bugs. */
export type OwnedEntityReference = {
  id: string;
  ownerId: OwnerId;
};
