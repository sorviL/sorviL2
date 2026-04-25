export const ShelfStatus = {
  Reading: "reading",
  WantToRead: "wantToRead",
  Read: "read",
  Rereading: "rereading",
  Abandoned: "abandoned",
} as const;

export type ShelfStatus = (typeof ShelfStatus)[keyof typeof ShelfStatus];
