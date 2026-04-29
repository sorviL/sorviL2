export const ShelfStatus = {
    Reading: "reading",
    WantToRead: "wantToRead",
    Read: "read",
    Rereading: "rereading",
    Abandoned: "abandoned"
} as const;

export type ShelfStatus = (typeof ShelfStatus)[keyof typeof ShelfStatus];

export const ShelfStatusBadgeColor: Record<ShelfStatus, string> = {
    [ShelfStatus.Reading]: "var(--color-status-reading)",
    [ShelfStatus.WantToRead]: "var(--color-status-want-to-read)",
    [ShelfStatus.Read]: "var(--color-status-read)",
    [ShelfStatus.Rereading]: "var(--color-status-rereading)",
    [ShelfStatus.Abandoned]: "var(--color-status-abandoned)"
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

export type BookshelfFilter = ShelfStatus | ExtraFilter;

export const EXTRA_FILTER_LABEL: Record<ExtraFilter, string> = {
    [ExtraFilter.Favorites]: "Favoritos",
    [ExtraFilter.Reviews]: "Resenhas"
};

export const EXTRA_FILTER_COLOR: Record<ExtraFilter, string> = {
    [ExtraFilter.Favorites]: "var(--color-filter-favorites)",
    [ExtraFilter.Reviews]: "var(--color-filter-reviews)"
};

export const EXTRA_FILTER_ICON: Record<ExtraFilter, string> = {
    [ExtraFilter.Favorites]: "favorite",
    [ExtraFilter.Reviews]: "rate_review"
};
