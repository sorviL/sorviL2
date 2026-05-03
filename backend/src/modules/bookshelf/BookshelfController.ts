import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { validateAddBookInput, validateBookshelfLookupQuery, validateBookshelfQuery, validateUpdateUserBookInput } from "./BookshelfSchemas.js";
import type { BookshelfService } from "./BookshelfService.js";

export class BookshelfController {
  constructor(private readonly service: BookshelfService) {}

  async list(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;

    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const queryValidation = validateBookshelfQuery(request.query);

    if (!queryValidation.success) {
      response.status(400).json({ message: queryValidation.message });
      return;
    }

    const result = await this.service.getBookshelf(userId, queryValidation.data);

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(200).json(result.data);
  }

  async add(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;

    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const bodyValidation = validateAddBookInput(request.body);

    if (!bodyValidation.success) {
      response.status(400).json({ message: bodyValidation.message });
      return;
    }

    const result = await this.service.addBookToShelf(userId, bodyValidation.data);

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(201).json({ message: "Livro adicionado à estante.", book: result.data });
  }

  async lookup(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;

    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const queryValidation = validateBookshelfLookupQuery(request.query);

    if (!queryValidation.success) {
      response.status(400).json({ message: queryValidation.message });
      return;
    }

    const result = await this.service.getBookStatus(userId, queryValidation.data.bookId);

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(200).json(result.data);
  }

  async update(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;

    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const userBookId = Number(request.params["userBookId"]);

    if (!Number.isInteger(userBookId) || userBookId <= 0) {
      response.status(400).json({ message: "ID do livro inválido." });
      return;
    }

    const bodyValidation = validateUpdateUserBookInput(request.body);

    if (!bodyValidation.success) {
      response.status(400).json({ message: bodyValidation.message });
      return;
    }

    const result = await this.service.updateUserBook(userId, userBookId, bodyValidation.data);

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(200).json({ message: "Livro atualizado.", book: result.data });
  }

  async remove(request: Request, response: Response): Promise<void> {
    const userId = (request as AuthenticatedRequest).authUser?.sub;

    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const userBookId = Number(request.params["userBookId"]);

    if (!Number.isInteger(userBookId) || userBookId <= 0) {
      response.status(400).json({ message: "ID do livro inválido." });
      return;
    }

    const result = await this.service.removeBookFromShelf(userId, userBookId);

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.status(200).json({ message: "Livro removido da estante." });
  }
}
