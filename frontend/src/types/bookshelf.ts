export const ShelfStatus = {
    Reading: "reading",
    WantToRead: "wantToRead",
    Read: "read",
    Rereading: "rereading",
    Abandoned: "abandoned"
} as const;

export type ShelfStatus = (typeof ShelfStatus)[keyof typeof ShelfStatus];

export const ShelfStatusBadgeColor: Record<ShelfStatus, string> = {
    [ShelfStatus.Reading]: "#bfb039",
    [ShelfStatus.WantToRead]: "#6337ad",
    [ShelfStatus.Read]: "#25a152",
    [ShelfStatus.Rereading]: "#43a2d1",
    [ShelfStatus.Abandoned]: "#912511"
};

export const SHELF_STATUS_LABEL: Record<ShelfStatus, string> = {
    [ShelfStatus.Reading]: "Lendo",
    [ShelfStatus.WantToRead]: "Quero Ler",
    [ShelfStatus.Read]: "Lido",
    [ShelfStatus.Rereading]: "Relendo",
    [ShelfStatus.Abandoned]: "Abandonado"
};

export const ExtraFilter = {
    Favorites: "favorites",
    Reviews: "reviews"
} as const;

export type ExtraFilter = (typeof ExtraFilter)[keyof typeof ExtraFilter];
