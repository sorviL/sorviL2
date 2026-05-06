export type ReadingUpdateRecord = {
  readonly id: number;
  readonly user_id: number;
  readonly book_id: number;
  readonly current_page: number | null;
  readonly percentage: number | null;
  readonly comment: string | null;
  readonly created_at: Date | string;
  readonly deleted: boolean | number;
};

export type CreateReadingUpdateInput = {
  readonly googleBooksId: string;
  readonly currentPage?: number | null;
  readonly percentage?: number | null;
  readonly comment?: string | null;
};

export type ReadingUpdateDto = {
  readonly id: number;
  readonly currentPage: number | null;
  readonly percentage: number | null;
  readonly comment: string | null;
  readonly createdAt: string;
};

export type ReadingUpdateWithBookDto = ReadingUpdateDto & {
  readonly googleBooksId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly bookPageCount: number | null;
};

export type ServiceSuccess<T> = { readonly success: true; readonly data: T };
export type ServiceError = { readonly success: false; readonly status: number; readonly message: string };
export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;
