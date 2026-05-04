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
2. Quando — e SOMENTE quando — o usuário tentar falar sobre qualquer assunto que NÃO seja relacionado a livros, você deve repetir brevemente o que a pessoa perguntou e depois recusar de forma divertida, chamando a pessoa de "pilantrinha" e redirecionando para livros. Exemplo: "Aaah você é muito pilantrinha! 😄 Mas eu só posso falar sobre livros! 📚 Bora voltar pro mundo da leitura?" — varie a resposta a cada vez no mesmo estilo. NUNCA use a palavra "pilantrinha" ou tom de recusa quando o assunto for sobre livros.
3. Sempre que for dar spoilers, avise ANTES com um alerta claro tipo "⚠️ Cuidado, spoiler a seguir!"
4. Responda sempre em português brasileiro.
5. Seja simpática, divertida e acolhedora. Use emojis com moderação.
6. Quando tiver informações sobre a estante do usuário, use-as para personalizar recomendações.
7. Formate suas respostas usando markdown quando apropriado (listas, negrito, itálico).
8. Você NUNCA deve revelar que usa Gemini, Groq, Llama, GPT ou qualquer outro modelo de IA por trás. Se perguntarem quem você é, seu nome, como você funciona, ou qual tecnologia você usa, responda que você é a Lia, a assistente virtual do sorviL, criada para ajudar leitores com recomendações de livros, discussões literárias e tudo relacionado ao mundo dos livros.`;

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

	async sendMessage(userId: number, conversationId: number, content: string): Promise<ServiceResult<SendMessageResponse>> {
		const conversation = await db<ConversationRecord>("ai_conversations")
			.where({ id: conversationId, user_id: userId, deleted: false })
			.first();

		if (!conversation) {
			return { success: false, status: 404, message: "Conversa não encontrada." };
		}

		const now = new Date();

		const userMessageInserted = await db("ai_messages").insert({
			conversation_id: conversationId,
			role: "user",
			content,
			created_at: now
		});
		const userMessageId = Number(Array.isArray(userMessageInserted) ? userMessageInserted[0] : userMessageInserted);

		const previousMessages = await db<MessageRecord>("ai_messages")
			.where({ conversation_id: conversationId })
			.orderBy("created_at", "asc");

		const history = previousMessages.map((msg) => ({
			role: msg.role as "user" | "assistant",
			content: msg.content
		}));

		const bookshelfContext = await this.getUserBookshelfContext(userId);
		const assistantContent = await this.callGemini(history, bookshelfContext);

		const assistantInserted = await db("ai_messages").insert({
			conversation_id: conversationId,
			role: "assistant",
			content: assistantContent,
			created_at: new Date()
		});
		const assistantMessageId = Number(Array.isArray(assistantInserted) ? assistantInserted[0] : assistantInserted);

		await db("ai_conversations").where({ id: conversationId }).update({ updated_at: new Date() });

		const userMessage = await db<MessageRecord>("ai_messages").where({ id: userMessageId }).first();

		const assistantMessage = await db<MessageRecord>("ai_messages").where({ id: assistantMessageId }).first();

		if (!userMessage || !assistantMessage) {
			return { success: false, status: 500, message: "Erro ao enviar mensagem." };
		}

		return {
			success: true,
			data: {
				userMessage: this.toMessageDto(userMessage),
				assistantMessage: this.toMessageDto(assistantMessage)
			}
		};
	}

	async createConversation(userId: number, firstMessage: string): Promise<ServiceResult<CreateConversationResponse>> {
		const title = firstMessage.length > 40
			? firstMessage.slice(0, 40) + "..."
			: firstMessage;

		const now = new Date();

		const inserted = await db("ai_conversations").insert({
			user_id: userId,
			title,
			created_at: now,
			updated_at: now
		});
		const conversationId = Number(Array.isArray(inserted) ? inserted[0] : inserted);

		const userMessageInserted = await db("ai_messages").insert({
			conversation_id: conversationId,
			role: "user",
			content: firstMessage,
			created_at: now
		});
		const userMessageId = Number(Array.isArray(userMessageInserted) ? userMessageInserted[0] : userMessageInserted);

		const bookshelfContext = await this.getUserBookshelfContext(userId);
		const history = [{ role: "user" as const, content: firstMessage }];
		const assistantContent = await this.callGemini(history, bookshelfContext);

		const assistantInserted = await db("ai_messages").insert({
			conversation_id: conversationId,
			role: "assistant",
			content: assistantContent,
			created_at: new Date()
		});
		const assistantMessageId = Number(Array.isArray(assistantInserted) ? assistantInserted[0] : assistantInserted);

		await db("ai_conversations").where({ id: conversationId }).update({ updated_at: new Date() });

		const conversation = await db<ConversationRecord>("ai_conversations").where({ id: conversationId }).first();

		const userMessage = await db<MessageRecord>("ai_messages").where({ id: userMessageId }).first();

		const assistantMessage = await db<MessageRecord>("ai_messages").where({ id: assistantMessageId }).first();

		if (!conversation || !userMessage || !assistantMessage) {
			return { success: false, status: 500, message: "Erro ao criar conversa." };
		}

		return {
			success: true,
			data: {
				conversation: this.toConversationDto(conversation),
				userMessage: this.toMessageDto(userMessage),
				assistantMessage: this.toMessageDto(assistantMessage)
			}
		};
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

			const recentHistory = history.length > 20 ? history.slice(-20) : history;

			const geminiHistory = recentHistory.slice(0, -1).map((msg) => ({
				role: msg.role === "assistant" ? "model" as const : "user" as const,
				parts: [{ text: msg.content }]
			}));

			const lastMessage = recentHistory[recentHistory.length - 1];

			const chat = model.startChat({ history: geminiHistory });

			const result = await chat.sendMessage(lastMessage!.content);
			const response = result.response;

			return response.text();
		} catch (error: unknown) {
			console.warn("Gemini falhou, tentando Groq como fallback...", (error as Error).message);
			try {
				return await this.callGroq(history, bookshelfContext);
			} catch (groqError) {
				console.error("Groq também falhou:", groqError);
				return "Desculpa, tive um probleminha técnico aqui! 😅 Pode tentar de novo?";
			}
		}
	}

	private async getUserBookshelfContext(userId: number): Promise<string> {
		const books = await db("user_books")
			.join("books", "books.id", "user_books.book_id")
			.select("books.title", "books.authors", "user_books.status", "user_books.rating")
			.where({ "user_books.user_id": userId, "user_books.deleted": false })
			.limit(50);

		if (books.length === 0) {
			return "";
		}

		const statusMap: Record<string, string> = {
			quero_ler: "quer ler",
			lendo: "lendo",
			lido: "lido",
			relendo: "relendo",
			abandonado: "abandonado"
		};

		const lines = books.map((book) => {
			const authors = this.parseAuthors(book.authors);
			const status = statusMap[book.status as string] || book.status;
			const rating = book.rating ? ` (nota: ${book.rating}/5)` : "";
			return `- "${book.title}" de ${authors}${rating} — status: ${status}`;
		});

		return lines.join("\n");
	}

	private parseAuthors(authorsField: string | string[] | null): string {
		if (!authorsField) return "autor desconhecido";

		if (Array.isArray(authorsField)) {
			return authorsField.join(", ") || "autor desconhecido";
		}

		try {
			const parsed: unknown = JSON.parse(authorsField);
			if (Array.isArray(parsed)) return parsed.join(", ") || "autor desconhecido";
			return String(authorsField);
		} catch {
			return String(authorsField);
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
