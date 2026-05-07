import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import type { LikesService } from "./LikesService.js";

export class LikesController {
  constructor(private readonly service: LikesService) {}

  async toggleReviewLike(request: Request, response: Response): Promise<void> {
    try {
      const userId = (request as AuthenticatedRequest).authUser?.sub;
      if (!userId) {
        response.status(401).json({ message: "Não autenticado." });
        return;
      }

      const reviewId = Number(request.params["id"]);
      if (!reviewId || Number.isNaN(reviewId)) {
        response.status(400).json({ message: "ID inválido." });
        return;
      }

      const result = await this.service.toggleReviewLike(userId, reviewId);
      response.status(200).json(result);
    } catch (err) {
      console.error("[LikesController.toggleReviewLike]", err);
      response.status(500).json({ message: "Erro interno." });
    }
  }

  async toggleUpdateLike(request: Request, response: Response): Promise<void> {
    try {
      const userId = (request as AuthenticatedRequest).authUser?.sub;
      if (!userId) {
        response.status(401).json({ message: "Não autenticado." });
        return;
      }

      const updateId = Number(request.params["id"]);
      if (!updateId || Number.isNaN(updateId)) {
        response.status(400).json({ message: "ID inválido." });
        return;
      }

      const result = await this.service.toggleUpdateLike(userId, updateId);
      response.status(200).json(result);
    } catch (err) {
      console.error("[LikesController.toggleUpdateLike]", err);
      response.status(500).json({ message: "Erro interno." });
    }
  }
}
