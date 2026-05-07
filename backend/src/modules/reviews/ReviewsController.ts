import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { validateCreateReviewInput } from "./ReviewsSchemas.js";
import type { ReviewsService } from "./ReviewsService.js";
import reviewsRead from "./reviews.read.js";

export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  async create(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;

    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const bodyValidation = validateCreateReviewInput(request.body);

    if (!bodyValidation.success) {
      response.status(400).json({ message: bodyValidation.message });
      return;
    }

    const result = await this.service.createReview(userId, bodyValidation.data);

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(201).json({ message: "Resenha criada com sucesso.", review: result.data });
  }

  async getByBook(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;

    if (!userId) {
      response.status(401).json({ message: 'Não autenticado.' });
      return;
    }

    const googleBooksId = (request.params['googleBooksId'] ?? '').toString();
    if (!googleBooksId) {
      response.status(400).json({ message: 'book id is required' });
      return;
    }

    const result = await this.service.getLatestUserReview(userId, googleBooksId);
    if (!result.success) {
      response.status(result.status || 500).json({ message: result.message || 'Erro' });
      return;
    }

    response.status(200).json({ review: result.data });
  }

  async getAll(request: Request, response: Response): Promise<void> {
    try {
      const page = request.query.page ? Number(request.query.page) : 1;
      const pageSize = request.query.pageSize ? Number(request.query.pageSize) : 50;
      const currentUserId = (request as AuthenticatedRequest).authUser?.sub;

      const result = await reviewsRead.fetchAllReviews({ page, pageSize, ...(currentUserId ? { currentUserId } : {}) });
      if (!result.success) {
        response.status(result.status).json({ success: false, message: result.message });
        return;
      }

      response.status(200).json({ success: true, data: result.data });
    } catch (err) {
      response.status(500).json({ success: false, message: "Erro interno ao listar resenhas" });
    }
  }

  async getRecent(request: Request, response: Response): Promise<void> {
    try {
      const userId = request.query.userId ? Number(request.query.userId) : undefined;
      const bookId = request.query.bookId ? Number(request.query.bookId) : undefined;
      const limit = request.query.limit ? Number(request.query.limit) : 10;
      const currentUserId = (request as AuthenticatedRequest).authUser?.sub;
      const filters: { userId?: number; bookId?: number; limit?: number; currentUserId?: number } = { limit, ...(currentUserId ? { currentUserId } : {}) };
      if (userId !== undefined) filters.userId = userId;
      if (bookId !== undefined) filters.bookId = bookId;

      const result = await reviewsRead.fetchRecentReviews(filters);
      if (!result.success) {
        response.status(result.status).json({ success: false, message: result.message });
        return;
      }

      response.status(200).json({ success: true, data: result.data });
    } catch (err) {
      response.status(500).json({ success: false, message: "Erro interno ao listar resenhas recentes" });
    }
  }

  async getStatsByGoogleBooksId(request: Request, response: Response): Promise<void> {
    try {
      const googleBooksId = (request.params['googleBooksId'] ?? '').toString();
      if (!googleBooksId) {
        response.status(400).json({ success: false, message: "googleBooksId inválido" });
        return;
      }

      const result = await reviewsRead.fetchBookStatsByGoogleId(googleBooksId);
      if (!result.success) {
        response.status(result.status).json({ success: false, message: result.message });
        return;
      }

      response.status(200).json({ success: true, data: result.data });
    } catch (err) {
      response.status(500).json({ success: false, message: "Erro interno ao buscar estatísticas de resenhas" });
    }
  }

  async getByBookId(request: Request, response: Response): Promise<void> {
    try {
      const bookId = Number(request.params.bookId);
      if (!bookId || Number.isNaN(bookId)) {
        response.status(400).json({ success: false, message: "bookId inválido" });
        return;
      }

      const order = request.query.order === "rating" ? "rating" : "date";
      const currentUserId = (request as AuthenticatedRequest).authUser?.sub;
      const result = await reviewsRead.fetchBookReviews(bookId, order, currentUserId);
      if (!result.success) {
        response.status(result.status).json({ success: false, message: result.message });
        return;
      }

      response.status(200).json({ success: true, data: result.data });
    } catch (err) {
      response.status(500).json({ success: false, message: "Erro interno ao listar resenhas do livro" });
    }
  }

  async delete(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;

    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const reviewId = Number(request.params["id"]);
    if (!reviewId || Number.isNaN(reviewId)) {
      response.status(400).json({ message: "ID da resenha inválido." });
      return;
    }

    const result = await this.service.deleteReview(userId, reviewId);

    if (!result.success) {
      response.status(result.status ?? 500).json({ message: result.message });
      return;
    }

    response.status(200).json({ message: "Resenha excluída com sucesso." });
  }

  async getReviewById(request: Request, response: Response): Promise<void> {
    try {
      const id = Number(request.params.id);
      if (!id || Number.isNaN(id)) {
        response.status(400).json({ success: false, message: "id inválido" });
        return;
      }

      const currentUserId = (request as AuthenticatedRequest).authUser?.sub;
      const result = await reviewsRead.fetchReviewById(id, currentUserId);
      if (!result.success) {
        response.status(result.status).json({ success: false, message: result.message });
        return;
      }
      if (!result.data) {
        response.status(404).json({ success: false, message: "Review não encontrada" });
        return;
      }

      response.status(200).json({ success: true, data: result.data });
    } catch (err) {
      response.status(500).json({ success: false, message: "Erro interno ao buscar review" });
    }
  }
}
