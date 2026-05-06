import type { ShelfStatus } from "../types/bookshelf";

export type BookshelfItemDto = {
  readonly userBookId: number;
  readonly bookId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly bookPageCount: number;
  readonly shelfStatus: ShelfStatus;
  readonly userRating: number;
  readonly isFavorite: boolean;
  readonly hasReview: boolean;
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
  readonly shelfStatus: ShelfStatus | null;
  readonly userBookId: number | null;
  readonly isFavorite: boolean;
};

export type ErrorResponse = {
  readonly message: string;
};
