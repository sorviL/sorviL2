import db from "../../config/database.js";
import type { ReviewRecord } from "./ReviewsTypes.js";

type ServiceSuccess<T> = { success: true; data: T };
type ServiceError = { success: false; status: number; message: string };
type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

export async function fetchReviewById(id: number): Promise<ServiceResult<any | null>> {
  try {
    const review = await db('reviews')
      .select(
        'reviews.id',
        'reviews.user_id',
        'users.nickname as author_name',
        'users.avatar_url as author_avatar',
        'reviews.book_id',
        'reviews.rating',
        'reviews.content',
        'reviews.has_spoiler',
        'reviews.created_at'
      )
      .leftJoin('users', 'reviews.user_id', 'users.id')
      .where({ 'reviews.id': id, 'reviews.deleted': false })
      .first();

    return { success: true, data: review ?? null };
  } catch (err) {
    return { success: false, status: 500, message: "Erro ao buscar review" };
  }
}

export async function fetchRecentReviews(opts: { userId?: number; bookId?: number; limit?: number } = {}): Promise<ServiceResult<Array<Pick<ReviewRecord, 'id' | 'user_id' | 'book_id' | 'rating' | 'content' | 'created_at'>>> > {
  try {
    const { userId, bookId, limit = 10 } = opts;


    let q = db('reviews')
      .select(
        'reviews.id',
        'reviews.user_id',
        'users.nickname as author_name',
        'users.avatar_url as author_avatar',
        'reviews.book_id',
        'reviews.rating',
        'reviews.content',
        'reviews.has_spoiler',
        'reviews.created_at'
      )
      .leftJoin('users', 'reviews.user_id', 'users.id')
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

export async function fetchAllReviews(opts: { page?: number; pageSize?: number } = {}): Promise<ServiceResult<{ items: Array<Pick<ReviewRecord, 'id' | 'user_id' | 'book_id' | 'rating' | 'content' | 'created_at'>>; total: number; page: number; pageSize: number }>> {
  try {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts.pageSize && opts.pageSize > 0 ? opts.pageSize : 50;
    const offset = (page - 1) * pageSize;

    const totalRow = await db('reviews').count('id as cnt').where('deleted', false).first();
    const total = totalRow ? Number((totalRow as any).cnt ?? 0) : 0;

    const items = await db('reviews')
      .select(
        'reviews.id',
        'reviews.user_id',
        'users.nickname as author_name',
        'users.avatar_url as author_avatar',
        'reviews.book_id',
        'reviews.rating',
        'reviews.content',
        'reviews.has_spoiler',
        'reviews.created_at'
      )
      .leftJoin('users', 'reviews.user_id', 'users.id')
      .where('reviews.deleted', false)
      .orderBy('reviews.created_at', 'desc')
      .offset(offset)
      .limit(pageSize);

    return { success: true, data: { items, total, page, pageSize } };
  } catch (err) {
    return { success: false, status: 500, message: 'Erro ao listar resenhas' };
  }
}

export async function fetchBookReviews(bookId: number, orderBy: 'date' | 'rating' = 'date'): Promise<ServiceResult<Array<Pick<ReviewRecord, 'id' | 'user_id' | 'book_id' | 'rating' | 'content' | 'created_at'>>> > {
  try {
    let q = db('reviews')
      .select(
        'reviews.id',
        'reviews.user_id',
        'users.nickname as author_name',
        'users.avatar_url as author_avatar',
        'reviews.book_id',
        'reviews.rating',
        'reviews.content',
        'reviews.has_spoiler',
        'reviews.created_at'
      )
      .leftJoin('users', 'reviews.user_id', 'users.id')
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
  fetchRecentReviews,
  fetchAllReviews,
  fetchBookReviews,
};
