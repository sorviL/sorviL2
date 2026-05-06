export const DB_STATUS_TO_FRONTEND = {
  quero_ler: "wantToRead",
  lendo: "reading",
  lido: "read",
  relendo: "rereading",
  abandonado: "abandoned"
} as const;

export const FRONTEND_STATUS_TO_DB = {
  wantToRead: "quero_ler",
  reading: "lendo",
  read: "lido",
  rereading: "relendo",
  abandoned: "abandonado"
} as const;

export type DbShelfStatus = keyof typeof DB_STATUS_TO_FRONTEND;
export type FrontendShelfStatus = (typeof DB_STATUS_TO_FRONTEND)[DbShelfStatus];

export const VALID_FRONTEND_STATUSES = Object.keys(FRONTEND_STATUS_TO_DB) as FrontendShelfStatus[];
export const VALID_DB_STATUSES = Object.keys(DB_STATUS_TO_FRONTEND) as DbShelfStatus[];

export type BookRecord = {
  readonly id: number;
  readonly google_books_id: string;
  readonly title: string;
  readonly authors: string | null;
  readonly synopsis: string | null;
  readonly cover_url: string | null;
  readonly publisher: string | null;
  readonly published_date: string | null;
  readonly page_count: number | null;
  readonly isbn_10: string | null;
  readonly isbn_13: string | null;
  readonly categories: string | null;
  readonly language: string | null;
  readonly created_at: Date | string;
};

export type UserBookRecord = {
  readonly id: number;
  readonly user_id: number;
  readonly book_id: number;
  readonly status: DbShelfStatus;
  readonly is_favorite: boolean | number;
  readonly rating: number | null;
  readonly current_page: number | null;
  readonly started_at: string | null;
  readonly finished_at: string | null;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
  readonly deleted: boolean | number;
};

export type UserBookJoinRow = UserBookRecord & {
  readonly google_books_id: string;
  readonly title: string;
  readonly authors: string | null;
  readonly cover_url: string | null;
  readonly page_count: number | null;
  readonly has_review: number | boolean;
};

export type BookshelfItemDto = {
  readonly userBookId: number;
  readonly bookId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly bookPageCount: number;
  readonly shelfStatus: FrontendShelfStatus;
  readonly userRating: number;
  readonly isFavorite: boolean;
  readonly hasReview: boolean;
};

export type AddBookInput = {
  readonly googleBooksId: string;
  readonly title: string;
  readonly authors: string[];
  readonly coverUrl: string | null;
  readonly pageCount: number;
  readonly status: FrontendShelfStatus;
};

export type UpdateUserBookInput = {
  readonly status?: FrontendShelfStatus | undefined;
  readonly isFavorite?: boolean | undefined;
  readonly rating?: number | null | undefined;
  readonly currentPage?: number | null | undefined;
};

export type BookshelfQueryParams = {
  readonly status?: FrontendShelfStatus | undefined;
  readonly filter?: "favorites" | "reviews" | undefined;
  readonly page: number;
  readonly limit: number;
};

export type BookshelfListResponse = {
  readonly books: BookshelfItemDto[];
  readonly filterCounts: Record<string, number>;
  readonly totalPagesRead: number;
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
};

export type BookshelfLookupResponse = {
  readonly inShelf: boolean;
  readonly hasReview: boolean;
  readonly shelfStatus: FrontendShelfStatus | null;
  readonly userBookId: number | null;
  readonly isFavorite: boolean;
};

export type ServiceSuccess<T> = { readonly success: true; readonly data: T };
export type ServiceError = { readonly success: false; readonly status: number; readonly message: string };
export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;
