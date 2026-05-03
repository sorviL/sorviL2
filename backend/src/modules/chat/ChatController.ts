import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { validateCreateConversationInput, validateSendMessageInput } from "./ChatSchemas.js";
import type { ChatService } from "./ChatService.js";

export class ChatController {
	constructor(private readonly service: ChatService) {}

	async listConversations(request: Request, response: Response): Promise<void> {
		const userId = (request as AuthenticatedRequest).authUser?.sub;

		if (!userId) {
			response.status(401).json({ message: "Não autenticado." });
			return;
		}

		const result = await this.service.getConversations(userId);

		if (!result.success) {
			response.status(result.status).json({ message: result.message });
			return;
		}

		response.status(200).json(result.data);
	}

	async createConversation(request: Request, response: Response): Promise<void> {
		const userId = (request as AuthenticatedRequest).authUser?.sub;

		if (!userId) {
			response.status(401).json({ message: "Não autenticado." });
			return;
		}

		const bodyValidation = validateCreateConversationInput(request.body);

		if (!bodyValidation.success) {
			response.status(400).json({ message: bodyValidation.message });
			return;
		}

		const result = await this.service.createConversation(userId, bodyValidation.data.message);

		if (!result.success) {
			response.status(result.status).json({ message: result.message });
			return;
		}

		response.status(201).json(result.data);
	}
}
