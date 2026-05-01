import db from "../../config/database.js";
import type {
  AddBookInput,
  BookRecord,
  BookshelfItemDto,
  BookshelfLookupResponse,
  BookshelfListResponse,
  BookshelfQueryParams,
  DbShelfStatus,
  FrontendShelfStatus,
  ServiceResult,
  UpdateUserBookInput,
  UserBookJoinRow,
  UserBookRecord
} from "./BookshelfTypes.js";
import { DB_STATUS_TO_FRONTEND, FRONTEND_STATUS_TO_DB, VALID_DB_STATUSES } from "./BookshelfTypes.js";

export class BookshelfService {
  async getBookshelf(userId: number, query: BookshelfQueryParams): Promise<ServiceResult<BookshelfListResponse>> {
    const filterCounts = await this.buildFilterCounts(userId);
    const totalPagesRead = await this.calculateTotalPagesRead(userId);

    const applyFilters = (qb: ReturnType<typeof db>) => {
      qb.where("user_books.user_id", userId).where("user_books.deleted", false);

      if (query.status) {
        qb.where("user_books.status", this.mapFrontendStatusToDb(query.status));
      }

      if (query.filter === "favorites") {
        qb.where("user_books.is_favorite", true);
      }

      if (query.filter === "reviews") {
        qb.whereExists(function () {
          this.select(db.raw(1))
            .from("reviews")
            .whereRaw("reviews.user_id = user_books.user_id")
            .whereRaw("reviews.book_id = user_books.book_id")
            .where("reviews.deleted", false);
        });
      }
    };

    const countQuery = db("user_books").count("user_books.id as total");
    applyFilters(countQuery);
    const countResult = await countQuery.first();
    const total = Number(countResult?.["total"] ?? 0);
    const totalPages = Math.max(Math.ceil(total / query.limit), 1);
    const offset = (query.page - 1) * query.limit;

    const dataQuery = db("user_books")
      .join("books", "books.id", "user_books.book_id")
      .select(
        "user_books.*",
        "books.google_books_id",
        "books.title",
        "books.authors",
        "books.cover_url",
        "books.page_count",
        db.raw("EXISTS(SELECT 1 FROM reviews WHERE reviews.user_id = user_books.user_id AND reviews.book_id = user_books.book_id AND reviews.deleted = false) as has_review")
      )
      .orderBy("user_books.updated_at", "desc")
      .limit(query.limit)
      .offset(offset);
    applyFilters(dataQuery);

    const rows = await dataQuery as UserBookJoinRow[];
    const books = rows.map((row) => this.toBookshelfItemDto(row));

    return {
      success: true,
      data: {
        books,
        filterCounts,
        totalPagesRead,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages
        },
      },
    };
  }

  async getBookStatus(userId: number, googleBooksId: string): Promise<ServiceResult<BookshelfLookupResponse>> {
    const book = await db<BookRecord>("books")
      .where("google_books_id", googleBooksId)
      .first();

    if (!book) {
      return {
        success: true,
        data: { inShelf: false, hasReview: false, shelfStatus: null, userBookId: null }
      };
    }

    const userBookRow = await db("user_books")
      .select(
        "user_books.id",
        "user_books.status",
        db.raw("EXISTS(SELECT 1 FROM reviews WHERE reviews.user_id = user_books.user_id AND reviews.book_id = user_books.book_id AND reviews.deleted = false) as has_review")
      )
      .where({ user_id: userId, book_id: book.id, deleted: false })
      .first() as { id: number; status: DbShelfStatus; has_review: number | boolean } | undefined;

    if (userBookRow) {
      return {
        success: true,
        data: {
          inShelf: true,
          hasReview: Boolean(userBookRow.has_review),
          shelfStatus: this.mapDbStatusToFrontend(userBookRow.status),
          userBookId: userBookRow.id
        }
      };
    }

    const hasReviewRow = await db("reviews")
      .select("id")
      .where({ user_id: userId, book_id: book.id, deleted: false })
      .first();

    return {
      success: true,
      data: {
        inShelf: false,
        hasReview: Boolean(hasReviewRow),
        shelfStatus: null,
        userBookId: null
      }
    };
  }

  async addBookToShelf(userId: number, input: AddBookInput): Promise<ServiceResult<BookshelfItemDto>> {
    const existingBook = await db<BookRecord>("books")
      .where("google_books_id", input.googleBooksId)
      .first();

    let bookId: number;

    if (existingBook) {
      bookId = existingBook.id;
    } else {
      const inserted = await db("books").insert({
        google_books_id: input.googleBooksId,
        title: input.title,
        authors: JSON.stringify(input.authors),
        cover_url: input.coverUrl,
        page_count: input.pageCount
      });
      bookId = Number(Array.isArray(inserted) ? inserted[0] : inserted);
    }

    const existingUserBook = await db<UserBookRecord>("user_books")
      .where({ user_id: userId, book_id: bookId })
      .first();

    if (existingUserBook && !existingUserBook.deleted) {
      return { success: false, status: 409, message: "Livro já está na estante." };
    }

    if (existingUserBook && existingUserBook.deleted) {
      await db("user_books")
        .where({ id: existingUserBook.id })
        .update({
          status: this.mapFrontendStatusToDb(input.status),
          is_favorite: false,
          rating: null,
          current_page: null,
          deleted: false,
          updated_at: db.fn.now()
        });
    } else {
      await db("user_books").insert({
        user_id: userId,
        book_id: bookId,
        status: this.mapFrontendStatusToDb(input.status)
      });
    }

    const createdRow = await db<UserBookJoinRow>("user_books")
      .join("books", "books.id", "user_books.book_id")
      .select(
        "user_books.*",
        "books.google_books_id",
        "books.title",
        "books.authors",
        "books.cover_url",
        "books.page_count",
        db.raw("false as has_review")
      )
      .where("user_books.user_id", userId)
      .where("user_books.book_id", bookId)
      .where("user_books.deleted", false)
      .first();

    if (!createdRow) {
      return { success: false, status: 500, message: "Erro ao adicionar livro à estante." };
    }

    return { success: true, data: this.toBookshelfItemDto(createdRow) };
  }

  async updateUserBook(userId: number, userBookId: number, input: UpdateUserBookInput): Promise<ServiceResult<BookshelfItemDto>> {
    const existingEntry = await db<UserBookRecord>("user_books")
      .where({ id: userBookId, user_id: userId, deleted: false })
      .first();

    if (!existingEntry) {
      return { success: false, status: 404, message: "Livro não encontrado na estante." };
    }

    const updateData: Record<string, unknown> = { updated_at: db.fn.now() };

    if (input.status !== undefined) {
      updateData["status"] = this.mapFrontendStatusToDb(input.status);
    }

    if (input.isFavorite !== undefined) {
      updateData["is_favorite"] = input.isFavorite;
    }

    if (input.rating !== undefined) {
      updateData["rating"] = input.rating;
    }

    if (input.currentPage !== undefined) {
      updateData["current_page"] = input.currentPage;
    }

    await db("user_books").where({ id: userBookId }).update(updateData);

    const updatedRow = await db<UserBookJoinRow>("user_books")
      .join("books", "books.id", "user_books.book_id")
      .select(
        "user_books.*",
        "books.google_books_id",
        "books.title",
        "books.authors",
        "books.cover_url",
        "books.page_count",
        db.raw("EXISTS(SELECT 1 FROM reviews WHERE reviews.user_id = user_books.user_id AND reviews.book_id = user_books.book_id AND reviews.deleted = false) as has_review")
      )
      .where("user_books.id", userBookId)
      .first();

    if (!updatedRow) {
      return { success: false, status: 500, message: "Erro ao atualizar livro na estante." };
    }

    return { success: true, data: this.toBookshelfItemDto(updatedRow) };
  }

  async removeBookFromShelf(userId: number, userBookId: number): Promise<ServiceResult<null>> {
    const existingEntry = await db<UserBookRecord>("user_books")
      .where({ id: userBookId, user_id: userId, deleted: false })
      .first();

    if (!existingEntry) {
      return { success: false, status: 404, message: "Livro não encontrado na estante." };
    }

    await db("user_books")
      .where({ id: userBookId })
      .update({ deleted: true, updated_at: db.fn.now() });

    return { success: true, data: null };
  }

  private toBookshelfItemDto(row: UserBookJoinRow): BookshelfItemDto {
    return {
      userBookId: row.id,
      bookId: row.google_books_id,
      bookTitle: row.title,
      bookAuthors: this.parseAuthors(row.authors),
      bookCoverImage: row.cover_url,
      bookPageCount: row.page_count ?? 0,
      shelfStatus: this.mapDbStatusToFrontend(row.status),
      userRating: Number(row.rating ?? 0),
      isFavorite: Boolean(row.is_favorite),
      hasReview: Boolean(row.has_review)
    };
  }

  private mapDbStatusToFrontend(dbStatus: DbShelfStatus): FrontendShelfStatus {
    return DB_STATUS_TO_FRONTEND[dbStatus];
  }

  private mapFrontendStatusToDb(frontendStatus: FrontendShelfStatus): DbShelfStatus {
    return FRONTEND_STATUS_TO_DB[frontendStatus];
  }

  private parseAuthors(authorsField: string | string[] | null): string[] {
    if (!authorsField) return [];

    if (Array.isArray(authorsField)) {
      return authorsField.filter((item): item is string => typeof item === "string");
    }

    try {
      const parsed: unknown = JSON.parse(authorsField);
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
      return [];
    } catch {
      return [];
    }
  }

  private async buildFilterCounts(userId: number): Promise<Record<string, number>> {
    const statusCounts = await db("user_books")
      .select("status")
      .count("id as count")
      .where({ user_id: userId, deleted: false })
      .groupBy("status");

    const favoritesCount = await db("user_books")
      .count("id as count")
      .where({ user_id: userId, deleted: false, is_favorite: true })
      .first();

    const reviewsCount = await db("user_books")
      .count("id as count")
      .where({ user_id: userId, deleted: false })
      .whereExists(function () {
        this.select(db.raw(1))
          .from("reviews")
          .whereRaw("reviews.user_id = user_books.user_id")
          .whereRaw("reviews.book_id = user_books.book_id")
          .where("reviews.deleted", false);
      })
      .first();

    const counts: Record<string, number> = { all: 0 };

    for (const dbStatus of VALID_DB_STATUSES) {
      counts[DB_STATUS_TO_FRONTEND[dbStatus]] = 0;
    }

    for (const row of statusCounts) {
      const statusRow = row as { status: DbShelfStatus; count: number | string };
      const frontendStatus = DB_STATUS_TO_FRONTEND[statusRow.status];
      const count = Number(statusRow.count);
      counts[frontendStatus] = count;
      counts["all"] = (counts["all"] ?? 0) + count;
    }

    counts["favorites"] = Number(favoritesCount?.["count"] ?? 0);
    counts["reviews"] = Number(reviewsCount?.["count"] ?? 0);

    return counts;
  }

  private async calculateTotalPagesRead(userId: number): Promise<number> {
    const result = await db("user_books")
      .join("books", "books.id", "user_books.book_id")
      .sum("books.page_count as total")
      .where({
        "user_books.user_id": userId,
        "user_books.status": "lido" satisfies DbShelfStatus,
        "user_books.deleted": false
      })
      .first();

    return Number(result?.["total"] ?? 0);
  }
}

export const bookshelfService = new BookshelfService();
