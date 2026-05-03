import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { validateCreateReviewInput } from "./ReviewsSchemas.js";
import type { ReviewsService } from "./ReviewsService.js";

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
}
