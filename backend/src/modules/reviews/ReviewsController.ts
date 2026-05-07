import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { validateCreateReviewInput } from "./ReviewsSchemas.js";
import type { ReviewsService } from "./ReviewsService.js";
import reviewsRead from "./reviews.read.js";

export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  async create(request: Request, response: Response): Promise<void> {
    try {
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
    } catch (err) {
      console.error("[ReviewsController.create]", err);
      response.status(500).json({ message: "Erro interno ao criar resenha." });
    }
  }

  async getByBook(request: Request, response: Response): Promise<void> {
    try {
      const userId = (request as AuthenticatedRequest).authUser?.sub;

      if (!userId) {
        response.status(401).json({ message: 'Não autenticado.' });
        return;
      }

      const googleBooksId = (request.params['googleBooksId'] ?? '').toString();
      if (!googleBooksId) {
        response.status(400).json({ message: 'googleBooksId é obrigatório.' });
        return;
      }

      const result = await this.service.getLatestUserReview(userId, googleBooksId);
      if (!result.success) {
        response.status(result.status || 500).json({ message: result.message || 'Erro' });
        return;
      }

      response.status(200).json({ review: result.data });
    } catch (err) {
      console.error("[ReviewsController.getByBook]", err);
      response.status(500).json({ message: "Erro interno ao buscar resenha." });
    }
  }

  async getAll(request: Request, response: Response): Promise<void> {
    try {
      const rawPage = request.query.page ? Number(request.query.page) : 1;
      const rawPageSize = request.query.pageSize ? Number(request.query.pageSize) : 50;
      const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
      const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(Math.floor(rawPageSize), 100) : 50;
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
      const rawUserId = request.query.userId ? Number(request.query.userId) : undefined;
      const rawBookId = request.query.bookId ? Number(request.query.bookId) : undefined;
      const rawLimit = request.query.limit ? Number(request.query.limit) : 10;
      const userId = rawUserId !== undefined && Number.isFinite(rawUserId) ? rawUserId : undefined;
      const bookId = rawBookId !== undefined && Number.isFinite(rawBookId) ? rawBookId : undefined;
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 50) : 10;
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
    try {
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
    } catch (err) {
      console.error("[ReviewsController.delete]", err);
      response.status(500).json({ message: "Erro interno ao excluir resenha." });
    }
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
