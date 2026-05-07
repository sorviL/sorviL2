import db from "../../config/database.js";
import type { ReviewRecord } from "./ReviewsTypes.js";

type ServiceSuccess<T> = { success: true; data: T };
type ServiceError = { success: false; status: number; message: string };
type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

const LIKE_COUNT_SUBQUERY = db.raw(
  "(SELECT COUNT(*) FROM review_reactions WHERE review_reactions.review_id = reviews.id AND review_reactions.type = 'like') as like_count"
);

function isLikedSubquery(userId: number) {
  return db.raw(
    "(SELECT COUNT(*) FROM review_reactions WHERE review_reactions.review_id = reviews.id AND review_reactions.user_id = ? AND review_reactions.type = 'like') as is_liked",
    [userId]
  );
}

export async function fetchReviewById(id: number, currentUserId?: number): Promise<ServiceResult<any | null>> {
  try {
    const selects: any[] = [
      'reviews.id',
      'reviews.user_id',
      'users.nickname as author_name',
      'users.avatar_url as author_avatar',
      'reviews.book_id',
      'books.google_books_id',
      'books.title as book_title',
      'books.authors as book_authors',
      'books.cover_url',
      'books.page_count as book_page_count',
      'reviews.rating',
      'reviews.content',
      'reviews.has_spoiler',
      'reviews.reading_start_date',
      'reviews.reading_end_date',
      'reviews.created_at',
      LIKE_COUNT_SUBQUERY,
    ];
    if (currentUserId) selects.push(isLikedSubquery(currentUserId));

    const review = await db('reviews')
      .select(...selects)
      .leftJoin('users', 'reviews.user_id', 'users.id')
      .leftJoin('books', 'reviews.book_id', 'books.id')
      .where({ 'reviews.id': id, 'reviews.deleted': false })
      .first();

    return { success: true, data: review ?? null };
  } catch (err) {
    return { success: false, status: 500, message: "Erro ao buscar review" };
  }
}

export async function fetchBookStatsByGoogleId(googleBooksId: string): Promise<ServiceResult<{ averageRating: number | null; reviewsCount: number }>> {
  try {
    const row = await db('reviews')
      .leftJoin('books', 'reviews.book_id', 'books.id')
      .where({ 'books.google_books_id': googleBooksId, 'reviews.deleted': false })
      .select(
        db.raw('AVG(reviews.rating) as average_rating'),
        db.raw('COUNT(*) as reviews_count')
      )
      .first();

    const averageRatingRaw = (row as any)?.average_rating;
    const averageRating = averageRatingRaw === null || averageRatingRaw === undefined ? null : Number(averageRatingRaw);
    const reviewsCount = row ? Number((row as any)?.reviews_count ?? 0) : 0;

    return { success: true, data: { averageRating, reviewsCount } };
  } catch (err) {
    return { success: false, status: 500, message: "Erro ao buscar estatísticas de resenhas" };
  }
}

export async function fetchRecentReviews(opts: { userId?: number; bookId?: number; limit?: number; currentUserId?: number } = {}): Promise<ServiceResult<Array<Pick<ReviewRecord, 'id' | 'user_id' | 'book_id' | 'rating' | 'content' | 'created_at'>>> > {
  try {
    const { userId, bookId, limit = 10, currentUserId } = opts;

    const selects: any[] = [
      'reviews.id',
      'reviews.user_id',
      'users.nickname as author_name',
      'users.avatar_url as author_avatar',
      'reviews.book_id',
      'books.google_books_id',
      'books.title as book_title',
      'books.authors as book_authors',
      'books.cover_url',
      'books.page_count as book_page_count',
      'reviews.rating',
      'reviews.content',
      'reviews.has_spoiler',
      'reviews.reading_start_date',
      'reviews.reading_end_date',
      'reviews.created_at',
      LIKE_COUNT_SUBQUERY,
    ];
    if (currentUserId) selects.push(isLikedSubquery(currentUserId));

    let q = db('reviews')
      .select(...selects)
      .leftJoin('users', 'reviews.user_id', 'users.id')
      .leftJoin('books', 'reviews.book_id', 'books.id')
      .where('reviews.deleted', false)
      .orderBy('reviews.created_at', 'desc')
      .limit(limit as number);

    if (userId) q = q.where('reviews.user_id', userId);
    if (bookId) q = q.where('reviews.book_id', bookId);

    const rows = await q;
    return { success: true, data: rows };
  } catch (err) {
    return { success: false, status: 500, message: 'Erro ao buscar resenhas recentes' };
  }
}

export async function fetchAllReviews(opts: { page?: number; pageSize?: number; currentUserId?: number } = {}): Promise<ServiceResult<{ items: Array<Pick<ReviewRecord, 'id' | 'user_id' | 'book_id' | 'rating' | 'content' | 'created_at'>>; total: number; page: number; pageSize: number }>> {
  try {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts.pageSize && opts.pageSize > 0 ? opts.pageSize : 50;
    const offset = (page - 1) * pageSize;
    const { currentUserId } = opts;

    const totalRow = await db('reviews').count('id as cnt').where('deleted', false).first();
    const total = totalRow ? Number((totalRow as any).cnt ?? 0) : 0;

    const selects: any[] = [
      'reviews.id',
      'reviews.user_id',
      'users.nickname as author_name',
      'users.avatar_url as author_avatar',
      'reviews.book_id',
      'books.google_books_id',
      'books.title as book_title',
      'books.authors as book_authors',
      'books.cover_url',
      'books.page_count as book_page_count',
      'reviews.rating',
      'reviews.content',
      'reviews.has_spoiler',
      'reviews.reading_start_date',
      'reviews.reading_end_date',
      'reviews.created_at',
      LIKE_COUNT_SUBQUERY,
    ];
    if (currentUserId) selects.push(isLikedSubquery(currentUserId));

    const items = await db('reviews')
      .select(...selects)
      .leftJoin('users', 'reviews.user_id', 'users.id')
      .leftJoin('books', 'reviews.book_id', 'books.id')
      .where('reviews.deleted', false)
      .orderBy('reviews.created_at', 'desc')
      .offset(offset)
      .limit(pageSize);

    return { success: true, data: { items, total, page, pageSize } };
  } catch (err) {
    return { success: false, status: 500, message: 'Erro ao listar resenhas' };
  }
}

export async function fetchBookReviews(bookId: number, orderBy: 'date' | 'rating' = 'date', currentUserId?: number): Promise<ServiceResult<Array<Pick<ReviewRecord, 'id' | 'user_id' | 'book_id' | 'rating' | 'content' | 'created_at'>>> > {
  try {
    const selects: any[] = [
      'reviews.id',
      'reviews.user_id',
      'users.nickname as author_name',
      'users.avatar_url as author_avatar',
      'reviews.book_id',
      'books.google_books_id',
      'books.title as book_title',
      'books.authors as book_authors',
      'books.cover_url',
      'books.page_count as book_page_count',
      'reviews.rating',
      'reviews.content',
      'reviews.has_spoiler',
      'reviews.reading_start_date',
      'reviews.reading_end_date',
      'reviews.created_at',
      LIKE_COUNT_SUBQUERY,
    ];
    if (currentUserId) selects.push(isLikedSubquery(currentUserId));

    let q = db('reviews')
      .select(...selects)
      .leftJoin('users', 'reviews.user_id', 'users.id')
      .leftJoin('books', 'reviews.book_id', 'books.id')
      .where({ 'reviews.book_id': bookId, 'reviews.deleted': false });

    if (orderBy === 'rating') {
      q = q.orderBy('reviews.rating', 'desc').orderBy('reviews.created_at', 'desc');
    } else {
      q = q.orderBy('reviews.created_at', 'desc');
    }

    const rows = await q;
    return { success: true, data: rows };
  } catch (err) {
    return { success: false, status: 500, message: 'Erro ao buscar resenhas do livro' };
  }
}

export default {
  fetchReviewById,
  fetchBookStatsByGoogleId,
  fetchRecentReviews,
  fetchAllReviews,
  fetchBookReviews,
};
