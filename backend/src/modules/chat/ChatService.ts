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
