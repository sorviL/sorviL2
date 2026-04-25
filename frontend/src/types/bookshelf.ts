export const ShelfStatus = {
  Reading: "reading",
  WantToRead: "wantToRead",
  Read: "read",
  Rereading: "rereading",
  Abandoned: "abandoned",
} as const;

export type ShelfStatus = (typeof ShelfStatus)[keyof typeof ShelfStatus];

export const ShelfStatusBadgeColor: Record<ShelfStatus, string> = {
  [ShelfStatus.Reading]: "#22c55e",
  [ShelfStatus.WantToRead]: "#8b5cf6",
  [ShelfStatus.Read]: "#3b82f6",
  [ShelfStatus.Rereading]: "#f97316",
  [ShelfStatus.Abandoned]: "#ef4444",
};
