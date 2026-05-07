import db from "../../config/database.js";
import { FRONTEND_STATUS_TO_DB } from "../bookshelf/BookshelfTypes.js";
import type {
  BookRecord,
  CreateReviewInput,
  CreateReviewResponse,
  ReviewRecord,
  ServiceResult,
  UserBookRecord
} from "./ReviewsTypes.js";

export class ReviewsService {
  async createReview(userId: number, input: CreateReviewInput): Promise<ServiceResult<CreateReviewResponse>> {
    try {
      const createdReview = await db.transaction(async (trx) => {
      const existingBook = await trx<BookRecord>("books")
        .where("google_books_id", input.book.googleBooksId)
        .first();

      let bookId: number;

      if (existingBook) {
        bookId = existingBook.id;

        const updates: Record<string, unknown> = {};
        if (!existingBook.page_count && input.book.pageCount) updates.page_count = input.book.pageCount;
        if (!existingBook.cover_url && input.book.coverUrl) updates.cover_url = input.book.coverUrl;
        if (Object.keys(updates).length > 0) {
          await trx("books").where("id", bookId).update(updates);
        }
      } else {
        const insertedBook = await trx("books").insert({
          google_books_id: input.book.googleBooksId,
          title: input.book.title,
          authors: JSON.stringify(input.book.authors),
          cover_url: input.book.coverUrl ?? null,
          page_count: input.book.pageCount ?? null
        });

        bookId = Number(Array.isArray(insertedBook) ? insertedBook[0] : insertedBook);
      }

      const shelfStatus = FRONTEND_STATUS_TO_DB[input.category];
      const existingUserBook = await trx<UserBookRecord>("user_books")
        .where({ user_id: userId, book_id: bookId })
        .first();

      if (existingUserBook) {
        await trx("user_books")
          .where({ id: existingUserBook.id })
          .update({
            status: shelfStatus,
            is_favorite: input.isFavorite ?? existingUserBook.is_favorite,
            deleted: false,
            updated_at: trx.fn.now()
          });
      } else {
        await trx("user_books").insert({
          user_id: userId,
          book_id: bookId,
          status: shelfStatus,
          is_favorite: input.isFavorite ?? false
        });
      }

      if (input.reviewId) {
        const currentReview = await trx<ReviewRecord>("reviews")
          .select("id", "book_id")
          .where({ id: input.reviewId, user_id: userId })
          .first();

        if (!currentReview) {
          throw new Error("REVIEW_NOT_FOUND");
        }

        const oldBookId = currentReview.book_id;

        if (oldBookId !== bookId) {
          await this.migrateUserBook(trx, userId, oldBookId, bookId, shelfStatus, input.isFavorite);

          await trx("reviews")
            .where({ user_id: userId, book_id: oldBookId })
            .update({ book_id: bookId, updated_at: trx.fn.now() });

          await trx("reading_updates")
            .where({ user_id: userId, book_id: oldBookId })
            .update({ book_id: bookId });
        }

        await trx("reviews")
          .where({ id: input.reviewId, user_id: userId })
          .update({
            rating: input.rating ?? null,
            content: input.content ?? null,
            has_spoiler: input.hasSpoiler ?? false,
            reading_start_date: input.readingStartDate ?? null,
            reading_end_date: input.readingEndDate ?? null,
            deleted: false,
            updated_at: trx.fn.now(),
          });

        const reviewRow = await trx<Pick<ReviewRecord, "id" | "created_at">>("reviews")
          .select("id", "created_at")
          .where("id", input.reviewId)
          .first();

        return {
          reviewId: input.reviewId,
          bookId: input.book.googleBooksId,
          category: input.category,
          rating: input.rating ?? null,
          content: input.content ?? null,
          createdAt: reviewRow?.created_at ?? new Date().toISOString(),
        } satisfies CreateReviewResponse;
      }

      const hasRating = input.rating !== undefined && input.rating !== null;
      const hasContent = input.content !== undefined && input.content !== null && String(input.content).trim() !== "";

      if (!hasRating && !hasContent) {
        return {
          reviewId: null,
          bookId: input.book.googleBooksId,
          category: input.category,
          rating: null,
          content: null,
          createdAt: new Date().toISOString()
        } satisfies CreateReviewResponse;
      }

      const existingReview = await trx<ReviewRecord>("reviews")
        .where({ user_id: userId, book_id: bookId })
        .first();

      let reviewId: number;
      let reviewRow: Pick<ReviewRecord, "id" | "created_at"> | undefined;

      if (existingReview) {
        await trx("reviews")
          .where({ id: existingReview.id })
          .update({
            rating: input.rating ?? null,
            content: input.content ?? null,
            has_spoiler: input.hasSpoiler ?? false,
            reading_start_date: input.readingStartDate ?? null,
            reading_end_date: input.readingEndDate ?? null,
            deleted: false,
            updated_at: trx.fn.now()
          });

        reviewId = existingReview.id;
        reviewRow = await trx<Pick<ReviewRecord, "id" | "created_at">>("reviews")
          .select("id", "created_at")
          .where("id", reviewId)
          .first();
      } else {
        const insertedReview = await trx("reviews").insert({
          user_id: userId,
          book_id: bookId,
          rating: input.rating ?? null,
          content: input.content ?? null,
          has_spoiler: input.hasSpoiler ?? false,
          reading_start_date: input.readingStartDate ?? null,
          reading_end_date: input.readingEndDate ?? null
        });

        reviewId = Number(Array.isArray(insertedReview) ? insertedReview[0] : insertedReview);

        reviewRow = await trx<Pick<ReviewRecord, "id" | "created_at">>("reviews")
          .select("id", "created_at")
          .where("id", reviewId)
          .first();
      }

      return {
        reviewId,
        bookId: input.book.googleBooksId,
        category: input.category,
        rating: input.rating ?? null,
        content: input.content ?? null,
        createdAt: reviewRow?.created_at ?? new Date().toISOString(),
      } satisfies CreateReviewResponse;
    });

      return { success: true, data: createdReview };
    } catch (err) {
      if (err instanceof Error && err.message === "REVIEW_NOT_FOUND") {
        return { success: false, status: 404, message: "Resenha não encontrada." };
      }
      throw err;
    }
  }

  private async migrateUserBook(
    trx: any,
    userId: number,
    oldBookId: number,
    newBookId: number,
    newStatus: string,
    isFavorite?: boolean,
  ): Promise<void> {
    const oldUserBook = await trx("user_books")
      .where({ user_id: userId, book_id: oldBookId })
      .first() as UserBookRecord | undefined;

    const newUserBook = await trx("user_books")
      .where({ user_id: userId, book_id: newBookId })
      .first() as UserBookRecord | undefined;

    if (newUserBook) {
      await trx("user_books")
        .where({ id: newUserBook.id })
        .update({
          status: newStatus,
          is_favorite: isFavorite ?? Boolean(oldUserBook?.is_favorite || newUserBook.is_favorite),
          deleted: false,
          updated_at: trx.fn.now(),
        });

      if (oldUserBook) {
        await trx("user_books")
          .where({ id: oldUserBook.id })
          .update({ deleted: true, updated_at: trx.fn.now() });
      }
    } else if (oldUserBook) {
      await trx("user_books")
        .where({ id: oldUserBook.id })
        .update({
          book_id: newBookId,
          status: newStatus,
          is_favorite: isFavorite ?? oldUserBook.is_favorite,
          deleted: false,
          updated_at: trx.fn.now(),
        });
    }
  }

  async getLatestUserReview(userId: number, googleBooksId: string) : Promise<ServiceResult<null | { id: number; rating: number | null; content: string | null; hasSpoiler: boolean; createdAt: string | null; readingStartDate: string | null; readingEndDate: string | null }>> {
    const bookRow = await db<BookRecord>('books').where('google_books_id', googleBooksId).first();
    if (!bookRow) {
      return { success: true, data: null };
    }

    const review = await db('reviews')
      .select('id', 'rating', 'content', 'has_spoiler', 'created_at', 'reading_start_date', 'reading_end_date')
      .where({ user_id: userId, book_id: bookRow.id, deleted: false })
      .orderBy('created_at', 'desc')
      .first();

    if (!review) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: review.id,
        rating: review.rating,
        content: review.content,
        hasSpoiler: Boolean(review.has_spoiler),
        createdAt: review.created_at,
        readingStartDate: review.reading_start_date ?? null,
        readingEndDate: review.reading_end_date ?? null,
      }
    };
  }

  async deleteReview(userId: number, reviewId: number): Promise<ServiceResult<null>> {
    const review = await db<ReviewRecord>("reviews")
      .where({ id: reviewId, user_id: userId, deleted: false })
      .first();

    if (!review) {
      return { success: false, status: 404, message: "Resenha não encontrada." };
    }

    await db("reviews")
      .where({ id: reviewId })
      .update({ deleted: true, updated_at: db.fn.now() });

    return { success: true, data: null };
  }

}

export const reviewsService = new ReviewsService();
