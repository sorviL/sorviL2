import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import type { ReadingUpdatesService } from "./ReadingUpdatesService.js";

export class ReadingUpdatesController {
  constructor(private readonly service: ReadingUpdatesService) {}

  async create(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;
    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const { googleBooksId, currentPage, percentage, comment, reaction, hasSpoiler } = request.body;

    if (!googleBooksId || typeof googleBooksId !== "string") {
      response.status(400).json({ message: "googleBooksId é obrigatório." });
      return;
    }

    if (currentPage === undefined && percentage === undefined && !comment && !reaction) {
      response.status(400).json({ message: "Informe página, porcentagem, comentário ou reação." });
      return;
    }

    if (currentPage != null && Number(currentPage) < 0) {
      response.status(400).json({ message: "Página atual não pode ser negativa." });
      return;
    }
    if (percentage != null && (Number(percentage) < 0 || Number(percentage) > 100)) {
      response.status(400).json({ message: "Porcentagem deve estar entre 0 e 100." });
      return;
    }

    const result = await this.service.createUpdate(userId, {
      googleBooksId,
      currentPage: currentPage != null ? Number(currentPage) : null,
      percentage: percentage != null ? Number(percentage) : null,
      comment: comment ?? null,
      reaction: reaction ?? null,
      hasSpoiler: Boolean(hasSpoiler),
    });

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(201).json({ success: true, data: result.data });
  }

  async getAll(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;
    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const page = request.query["page"] ? Number(String(request.query["page"])) : 1;
    const limit = request.query["limit"] ? Number(String(request.query["limit"])) : 50;

    const result = await this.service.getAllUpdates(userId, page, limit);
    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(200).json({ success: true, data: result.data });
  }

  async getByBook(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;
    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const googleBooksId = (request.params["googleBooksId"] ?? "").toString();
    if (!googleBooksId) {
      response.status(400).json({ message: "googleBooksId é obrigatório." });
      return;
    }

    const page = request.query["page"] ? Number(String(request.query["page"])) : 1;
    const limit = request.query["limit"] ? Number(String(request.query["limit"])) : 20;

    const result = await this.service.getUpdates(googleBooksId, userId, page, limit);
    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(200).json({ success: true, data: result.data });
  }

  async getLatest(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;
    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const googleBooksId = (request.params["googleBooksId"] ?? "").toString();
    if (!googleBooksId) {
      response.status(400).json({ message: "googleBooksId é obrigatório." });
      return;
    }

    const result = await this.service.getLatestUpdate(googleBooksId, userId);
    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(200).json({ success: true, data: result.data });
  }

  async update(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;
    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const updateId = Number(request.params["id"]);
    if (!updateId || Number.isNaN(updateId)) {
      response.status(400).json({ message: "id inválido." });
      return;
    }

    const { currentPage, percentage, comment, reaction, hasSpoiler } = request.body;

    if (currentPage != null && Number(currentPage) < 0) {
      response.status(400).json({ message: "Página atual não pode ser negativa." });
      return;
    }
    if (percentage != null && (Number(percentage) < 0 || Number(percentage) > 100)) {
      response.status(400).json({ message: "Porcentagem deve estar entre 0 e 100." });
      return;
    }

    const result = await this.service.updateUpdate(userId, updateId, {
      currentPage: currentPage != null ? Number(currentPage) : null,
      percentage: percentage != null ? Number(percentage) : null,
      comment: comment ?? null,
      reaction: reaction ?? null,
      hasSpoiler: Boolean(hasSpoiler),
    });

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(200).json({ success: true, data: result.data });
  }

  async delete(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;
    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const updateId = Number(request.params["id"]);
    if (!updateId || Number.isNaN(updateId)) {
      response.status(400).json({ message: "id inválido." });
      return;
    }

    const result = await this.service.deleteUpdate(userId, updateId);
    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(200).json({ success: true, data: null });
  }
}
