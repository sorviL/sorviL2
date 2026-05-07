import db from "../../config/database.js";
import type {
  CreateReadingUpdateInput,
  UpdateReadingUpdateInput,
  ReadingUpdateDto,
  ReadingUpdateRecord,
  ReadingUpdateWithBookDto,
  ServiceResult,
} from "./ReadingUpdatesTypes.js";

type BookRecord = { readonly id: number; readonly page_count: number | null };

export class ReadingUpdatesService {
  async createUpdate(userId: number, input: CreateReadingUpdateInput): Promise<ServiceResult<ReadingUpdateDto>> {
    const book = await db<BookRecord>("books")
      .select("id", "page_count")
      .where("google_books_id", input.googleBooksId)
      .first();

    if (!book) {
      return { success: false, status: 404, message: "Livro não encontrado." };
    }

    const userBook = await db("user_books")
      .where({ user_id: userId, book_id: book.id, deleted: false })
      .first();

    if (!userBook) {
      return { success: false, status: 400, message: "Livro não está na estante." };
    }

    let percentage = input.percentage ?? null;
    const currentPage = input.currentPage ?? null;

    if (currentPage !== null && book.page_count && book.page_count > 0 && percentage === null) {
      percentage = Math.min(Math.round((currentPage / book.page_count) * 10000) / 100, 100);
    }

    const inserted = await db("reading_updates").insert({
      user_id: userId,
      book_id: book.id,
      current_page: currentPage,
      percentage,
      comment: input.comment?.trim() || null,
      reaction: input.reaction?.trim() || null,
      has_spoiler: input.hasSpoiler ? true : false,
    });

    const insertedId = Number(Array.isArray(inserted) ? inserted[0] : inserted);

    if (currentPage !== null) {
      await db("user_books")
        .where({ id: userBook.id })
        .update({ current_page: currentPage, updated_at: db.fn.now() });
    }

    const row = await db<ReadingUpdateRecord>("reading_updates")
      .where("id", insertedId)
      .first();

    return {
      success: true,
      data: {
        id: insertedId,
        currentPage: row?.current_page ?? currentPage,
        percentage: row?.percentage != null ? Number(row.percentage) : percentage,
        comment: row?.comment ?? null,
        reaction: row?.reaction ?? null,
        hasSpoiler: Boolean(row?.has_spoiler),
        createdAt: String(row?.created_at ?? new Date().toISOString()),
      },
    };
  }

  async getUpdates(
    googleBooksId: string,
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<ServiceResult<{ items: ReadingUpdateDto[]; total: number }>> {
    const book = await db("books").where("google_books_id", googleBooksId).first();
    if (!book) {
      return { success: true, data: { items: [], total: 0 } };
    }

    const countResult = await db("reading_updates")
      .count("id as total")
      .where({ user_id: userId, book_id: book.id, deleted: false })
      .first();

    const total = Number(countResult?.["total"] ?? 0);
    const offset = (page - 1) * limit;

    const rows = await db<ReadingUpdateRecord>("reading_updates")
      .where({ user_id: userId, book_id: book.id, deleted: false })
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    const items: ReadingUpdateDto[] = rows.map((r) => ({
      id: r.id,
      currentPage: r.current_page,
      percentage: r.percentage !== null ? Number(r.percentage) : null,
      comment: r.comment,
      reaction: r.reaction ?? null,
      hasSpoiler: Boolean(r.has_spoiler),
      createdAt: String(r.created_at),
    }));

    return { success: true, data: { items, total } };
  }

  async getLatestUpdate(googleBooksId: string, userId: number): Promise<ServiceResult<ReadingUpdateDto | null>> {
    const book = await db("books").where("google_books_id", googleBooksId).first();
    if (!book) {
      return { success: true, data: null };
    }

    const row = await db<ReadingUpdateRecord>("reading_updates")
      .where({ user_id: userId, book_id: book.id, deleted: false })
      .orderBy("created_at", "desc")
      .first();

    if (!row) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: row.id,
        currentPage: row.current_page,
        percentage: row.percentage !== null ? Number(row.percentage) : null,
        comment: row.comment,
        reaction: row.reaction ?? null,
        hasSpoiler: Boolean(row.has_spoiler),
        createdAt: String(row.created_at),
      },
    };
  }

  async getAllUpdates(
    userId: number,
    page = 1,
    limit = 50,
  ): Promise<ServiceResult<{ items: ReadingUpdateWithBookDto[]; total: number }>> {
    const countResult = await db("reading_updates")
      .count("reading_updates.id as total")
      .join("user_books", function () {
        this.on("user_books.user_id", "reading_updates.user_id")
          .andOn("user_books.book_id", "reading_updates.book_id");
      })
      .where({ "reading_updates.user_id": userId, "reading_updates.deleted": false })
      .where("user_books.deleted", false)
      .first();

    const total = Number(countResult?.["total"] ?? 0);
    const offset = (page - 1) * limit;

    const rows = await db("reading_updates")
      .select(
        "reading_updates.id",
        "reading_updates.current_page",
        "reading_updates.percentage",
        "reading_updates.comment",
        "reading_updates.reaction",
        "reading_updates.has_spoiler",
        "reading_updates.created_at",
        "books.google_books_id",
        "books.title as book_title",
        "books.authors as book_authors",
        "books.cover_url as book_cover_image",
        "books.page_count as book_page_count",
        db.raw("(SELECT COUNT(*) FROM reading_update_likes WHERE reading_update_likes.reading_update_id = reading_updates.id) as like_count"),
        db.raw("(SELECT COUNT(*) FROM reading_update_likes WHERE reading_update_likes.reading_update_id = reading_updates.id AND reading_update_likes.user_id = ?) as is_liked", [userId])
      )
      .join("books", "books.id", "reading_updates.book_id")
      .join("user_books", function () {
        this.on("user_books.user_id", "reading_updates.user_id")
          .andOn("user_books.book_id", "reading_updates.book_id");
      })
      .where({ "reading_updates.user_id": userId, "reading_updates.deleted": false })
      .where("user_books.deleted", false)
      .orderBy("reading_updates.created_at", "desc")
      .limit(limit)
      .offset(offset);

    const items: ReadingUpdateWithBookDto[] = rows.map((r: Record<string, unknown>) => {
      let authors: string[] = [];
      if (typeof r["book_authors"] === "string") {
        try { authors = JSON.parse(r["book_authors"] as string); } catch { authors = []; }
      } else if (Array.isArray(r["book_authors"])) {
        authors = r["book_authors"] as string[];
      }

      return {
        id: Number(r["id"]),
        currentPage: r["current_page"] != null ? Number(r["current_page"]) : null,
        percentage: r["percentage"] != null ? Number(r["percentage"]) : null,
        comment: (r["comment"] as string) ?? null,
        reaction: (r["reaction"] as string) ?? null,
        hasSpoiler: Boolean(r["has_spoiler"]),
        createdAt: String(r["created_at"]),
        googleBooksId: String(r["google_books_id"]),
        bookTitle: String(r["book_title"] ?? ""),
        bookAuthors: authors,
        bookCoverImage: (r["book_cover_image"] as string) ?? null,
        bookPageCount: r["book_page_count"] != null ? Number(r["book_page_count"]) : null,
        likeCount: Number(r["like_count"] ?? 0),
        isLiked: Number(r["is_liked"] ?? 0) > 0,
      };
    });

    return { success: true, data: { items, total } };
  }

  async updateUpdate(userId: number, updateId: number, input: UpdateReadingUpdateInput): Promise<ServiceResult<ReadingUpdateDto>> {
    const row = await db<ReadingUpdateRecord>("reading_updates")
      .where({ id: updateId, user_id: userId, deleted: false })
      .first();

    if (!row) {
      return { success: false, status: 404, message: "Atualização não encontrada." };
    }

    try {
    const result = await db.transaction(async (trx) => {
      let bookId = row.book_id;
      const oldBookId = row.book_id;

      if (input.googleBooksId) {
        const newBook = await trx("books")
          .select("id", "page_count")
          .where("google_books_id", input.googleBooksId)
          .first() as BookRecord | undefined;

        if (!newBook) {
          throw new Error("BOOK_NOT_FOUND");
        }

        bookId = newBook.id;

        if (oldBookId !== bookId) {
          const oldUb = await trx("user_books")
            .where({ user_id: userId, book_id: oldBookId, deleted: false })
            .first();

          const newUb = await trx("user_books")
            .where({ user_id: userId, book_id: bookId })
            .first();

          if (newUb) {
            await trx("user_books")
              .where({ user_id: userId, book_id: bookId })
              .update({
                is_favorite: Boolean(oldUb?.is_favorite || newUb.is_favorite),
                deleted: false,
                updated_at: trx.fn.now(),
              });
          } else if (oldUb) {
            await trx("user_books")
              .where({ user_id: userId, book_id: oldBookId })
              .update({
                book_id: bookId,
                deleted: false,
                updated_at: trx.fn.now(),
              });
          } else {
            await trx("user_books").insert({
              user_id: userId,
              book_id: bookId,
              status: "lendo",
              is_favorite: false,
            });
          }

          await trx("reviews")
            .where({ user_id: userId, book_id: oldBookId })
            .update({ book_id: bookId, updated_at: trx.fn.now() });

          await trx("reading_updates")
            .where({ user_id: userId, book_id: oldBookId })
            .update({ book_id: bookId });

          await trx("user_books")
            .where({ user_id: userId, book_id: oldBookId })
            .update({ deleted: true, updated_at: trx.fn.now() });
        } else {
          const userBook = await trx("user_books")
            .where({ user_id: userId, book_id: bookId, deleted: false })
            .first();

          if (!userBook) {
            throw new Error("BOOK_NOT_IN_SHELF");
          }
        }
      }

      const book = await trx("books").where("id", bookId).first() as BookRecord | undefined;
      let percentage = input.percentage ?? null;
      const currentPage = input.currentPage ?? null;

      if (currentPage !== null && book?.page_count && book.page_count > 0 && percentage === null) {
        percentage = Math.min(Math.round((currentPage / book.page_count) * 10000) / 100, 100);
      }

      await trx("reading_updates").where({ id: updateId }).update({
        book_id: bookId,
        current_page: currentPage,
        percentage,
        comment: input.comment?.trim() || null,
        reaction: input.reaction?.trim() || null,
        has_spoiler: input.hasSpoiler ? true : false,
      });

      if (currentPage !== null) {
        await trx("user_books")
          .where({ user_id: userId, book_id: bookId, deleted: false })
          .update({ current_page: currentPage, updated_at: trx.fn.now() });
      }

      const updated = await trx("reading_updates").where("id", updateId).first() as ReadingUpdateRecord | undefined;

      return {
        id: updateId,
        currentPage: updated?.current_page ?? currentPage,
        percentage: updated?.percentage != null ? Number(updated.percentage) : percentage,
        comment: updated?.comment ?? null,
        reaction: updated?.reaction ?? null,
        hasSpoiler: Boolean(updated?.has_spoiler),
        createdAt: String(updated?.created_at ?? row.created_at),
      } satisfies ReadingUpdateDto;
    });

    return { success: true, data: result };
    } catch (err) {
      if (err instanceof Error && err.message === "BOOK_NOT_FOUND") {
        return { success: false, status: 404, message: "Livro não encontrado." };
      }
      if (err instanceof Error && err.message === "BOOK_NOT_IN_SHELF") {
        return { success: false, status: 400, message: "Livro não está na estante." };
      }
      throw err;
    }
  }

  async deleteUpdate(userId: number, updateId: number): Promise<ServiceResult<null>> {
    const row = await db<ReadingUpdateRecord>("reading_updates")
      .where({ id: updateId, user_id: userId, deleted: false })
      .first();

    if (!row) {
      return { success: false, status: 404, message: "Atualização não encontrada." };
    }

    await db("reading_updates")
      .where({ id: updateId })
      .update({ deleted: true });

    return { success: true, data: null };
  }
}

export const readingUpdatesService = new ReadingUpdatesService();
