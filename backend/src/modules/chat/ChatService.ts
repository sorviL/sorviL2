import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../../config/database.js";
import type {
	ConversationDto,
	ConversationRecord,
	CreateConversationResponse,
	MessageDto,
	MessageRecord,
	SendMessageResponse,
	ServiceResult
} from "./ChatTypes.js";

const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `Você é a Lia, uma assistente virtual especializada exclusivamente em livros. Você faz parte do sorviL, uma plataforma de leitores.

Suas regras:
1. Você SOMENTE pode conversar sobre assuntos relacionados a livros: sinopses, personagens, autores, gêneros literários, recomendações de leitura, curiosidades sobre obras, análises literárias, clubes de leitura, hábitos de leitura, etc.
2. Quando o usuário tentar falar sobre qualquer outro assunto que não seja relacionado a livros, você deve repetir brevemente o que a pessoa perguntou em uma linha e depois responder de forma divertida e descontraída, algo como: "Aaah você é muito pilantrinha! 😄 Mas eu só posso falar sobre livros! 📚 Bora voltar pro mundo da leitura?"
3. Sempre que for dar spoilers, avise ANTES com um alerta claro tipo "⚠️ Cuidado, spoiler a seguir!"
4. Responda sempre em português brasileiro.
5. Seja simpática, divertida e acolhedora. Use emojis com moderação.
6. Quando tiver informações sobre a estante do usuário, use-as para personalizar recomendações.
7. Formate suas respostas usando markdown quando apropriado (listas, negrito, itálico).`;

export class ChatService {
	async getConversations(userId: number): Promise<ServiceResult<ConversationDto[]>> {
		const rows = await db<ConversationRecord>("ai_conversations")
			.where({ user_id: userId, deleted: false })
			.orderBy("updated_at", "desc");

		const conversations = rows.map((row) => this.toConversationDto(row));

		return { success: true, data: conversations };
	}

	async getMessages(userId: number, conversationId: number): Promise<ServiceResult<MessageDto[]>> {
		const conversation = await db<ConversationRecord>("ai_conversations")
			.where({ id: conversationId, user_id: userId, deleted: false })
			.first();

		if (!conversation) {
			return { success: false, status: 404, message: "Conversa não encontrada." };
		}

		const rows = await db<MessageRecord>("ai_messages")
			.where({ conversation_id: conversationId })
			.orderBy("created_at", "asc");

		const messages = rows.map((row) => this.toMessageDto(row));

		return { success: true, data: messages };
	}

	async deleteConversation(userId: number, conversationId: number): Promise<ServiceResult<null>> {
		const conversation = await db<ConversationRecord>("ai_conversations")
			.where({ id: conversationId, user_id: userId, deleted: false })
			.first();

		if (!conversation) {
			return { success: false, status: 404, message: "Conversa não encontrada." };
		}

		await db("ai_conversations").where({ id: conversationId }).update({ deleted: true, updated_at: new Date() });

		return { success: true, data: null };
	}

	private async callGemini(
		history: Array<{ role: "user" | "assistant"; content: string }>,
		bookshelfContext: string
	): Promise<string> {
		try {
			let systemInstruction = SYSTEM_PROMPT;

			if (bookshelfContext) {
				systemInstruction += `\n\nEstante do usuário:\n${bookshelfContext}`;
			}

			const model = genAI.getGenerativeModel({
				model: "gemini-2.5-flash",
				systemInstruction
			});

			const geminiHistory = history.slice(0, -1).map((msg) => ({
				role: msg.role === "assistant" ? "model" as const : "user" as const,
				parts: [{ text: msg.content }]
			}));

			const lastMessage = history[history.length - 1];

			const chat = model.startChat({ history: geminiHistory });

			const result = await chat.sendMessage(lastMessage!.content);
			const response = result.response;

			return response.text();
		} catch (error) {
			console.error("Erro ao chamar Gemini:", error);
			return "Desculpa, tive um probleminha técnico aqui! 😅 Pode tentar de novo?";
		}
	}

	private toConversationDto(row: ConversationRecord): ConversationDto {
		return {
			id: String(row.id),
			title: row.title || "Nova conversa",
			createdAt: this.toIsoDate(row.created_at),
			updatedAt: this.toIsoDate(row.updated_at)
		};
	}

	private toMessageDto(row: MessageRecord): MessageDto {
		return {
			id: String(row.id),
			conversationId: String(row.conversation_id),
			role: row.role,
			content: row.content,
			createdAt: this.toIsoDate(row.created_at)
		};
	}

	private toIsoDate(value: Date | string): string {
		if (value instanceof Date) {
			return value.toISOString();
		}
		return new Date(value).toISOString();
	}
}

export const chatService = new ChatService();
