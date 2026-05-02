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
    const createdReview = await db.transaction(async (trx) => {
      const existingBook = await trx<BookRecord>("books")
        .where("google_books_id", input.book.googleBooksId)
        .first();

      let bookId: number;

      if (existingBook) {
        bookId = existingBook.id;
      } else {
        const insertedBook = await trx("books").insert({
          google_books_id: input.book.googleBooksId,
          title: input.book.title,
          authors: JSON.stringify(input.book.authors),
          cover_url: input.book.coverUrl ?? null,
          page_count: input.book.pageCount ?? null,
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
            deleted: false,
            updated_at: trx.fn.now(),
          });
      } else {
        await trx("user_books").insert({
          user_id: userId,
          book_id: bookId,
          status: shelfStatus,
        });
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
          createdAt: new Date().toISOString(),
        } satisfies CreateReviewResponse;
      }

      const insertedReview = await trx("reviews").insert({
        user_id: userId,
        book_id: bookId,
        rating: input.rating ?? null,
        content: input.content ?? null,
        has_spoiler: input.hasSpoiler ?? false,
        reading_start_date: input.readingStartDate ?? null,
        reading_end_date: input.readingEndDate ?? null,
      });

      const reviewId = Number(Array.isArray(insertedReview) ? insertedReview[0] : insertedReview);

      const reviewRow = await trx<ReviewRecord>("reviews")
        .select("id", "created_at")
        .where("id", reviewId)
        .first();

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
  }
}

export const reviewsService = new ReviewsService();
