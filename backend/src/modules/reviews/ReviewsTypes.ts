import type { DbShelfStatus, FrontendShelfStatus } from "../bookshelf/BookshelfTypes.js";

export type CreateReviewBookInput = {
  readonly googleBooksId: string;
  readonly title: string;
  readonly authors: string[];
  readonly coverUrl?: string | null | undefined;
  readonly pageCount?: number | null | undefined;
};

export type CreateReviewInput = {
  readonly book: CreateReviewBookInput;
  readonly category: FrontendShelfStatus;
  readonly rating?: number | null;
  readonly content?: string | null;
  readonly hasSpoiler?: boolean | undefined;
  readonly readingStartDate?: string | undefined;
  readonly readingEndDate?: string | undefined;
  readonly reviewId?: number | null;
};

export type ReviewRecord = {
  readonly id: number;
  readonly user_id: number;
  readonly book_id: number;
  readonly rating: number | null;
  readonly content: string | null;
  readonly has_spoiler: boolean | number;
  readonly reading_start_date: string | null;
  readonly reading_end_date: string | null;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
  readonly deleted: boolean | number;
};

export type CreateReviewResponse = {
  readonly reviewId?: number | null;
  readonly bookId: string;
  readonly category: FrontendShelfStatus;
  readonly rating?: number | null;
  readonly content?: string | null;
  readonly createdAt?: Date | string | null;
};
export type ReviewRecord = {
  readonly id: number;
  readonly user_id: number;
  readonly book_id: number;
  readonly rating: number;
  readonly content: string;
  readonly has_spoiler: boolean | number;
  readonly reading_start_date: string | null;
  readonly reading_end_date: string | null;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
  readonly deleted: boolean | number;
};

export type UserBookRecord = {
  readonly id: number;
  readonly user_id: number;
  readonly book_id: number;
  readonly status: DbShelfStatus;
  readonly deleted: boolean | number;
};

export type BookRecord = {
  readonly id: number;
  readonly google_books_id: string;
};

export type CreateReviewResponse = {
  readonly reviewId: number;
  readonly bookId: string;
  readonly category: FrontendShelfStatus;
  readonly rating: number;
  readonly content: string;
  readonly createdAt: Date | string;
};

export type ServiceSuccess<T> = { readonly success: true; readonly data: T };
export type ServiceError = { readonly success: false; readonly status: number; readonly message: string };
export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;
