import type { ChatConversation, ChatMessage } from "../types/chat";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

type ErrorResponse = { message?: string };

type ApiResponse<T> =
	| { success: true; data: T }
	| { success: false; error: string };

async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
	const isJson = response.headers.get("content-type")?.includes("application/json");
	const body = isJson ? await response.json() : null;

	if (!response.ok) {
		const errorMessage = (body as ErrorResponse | null)?.message || "Erro na requisição.";
		return { success: false, error: errorMessage };
	}

	return { success: true, data: body as T };
}

async function safeFetch(input: RequestInfo | URL, init: RequestInit): Promise<Response | null> {
	try {
		return await fetch(input, init);
	} catch {
		return null;
	}
}

export type CreateConversationResponse = {
	conversation: ChatConversation;
	userMessage: ChatMessage;
	assistantMessage: ChatMessage;
};

export type SendMessageResponse = {
	userMessage: ChatMessage;
	assistantMessage: ChatMessage;
};

export async function getConversations(): Promise<ApiResponse<ChatConversation[]>> {
	const response = await safeFetch(`${API_BASE_URL}/chat/conversations`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include"
	});

	if (!response) {
		return { success: false, error: "Não foi possível conectar ao servidor." };
	}

	return handleApiResponse<ChatConversation[]>(response);
}

export async function getMessages(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
	const response = await safeFetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		credentials: "include"
	});

	if (!response) {
		return { success: false, error: "Não foi possível conectar ao servidor." };
	}

	return handleApiResponse<ChatMessage[]>(response);
}

export async function createConversation(
	firstMessage: string
): Promise<ApiResponse<CreateConversationResponse>> {
	const response = await safeFetch(`${API_BASE_URL}/chat/conversations`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ message: firstMessage })
	});

	if (!response) {
		return { success: false, error: "Não foi possível conectar ao servidor." };
	}

	return handleApiResponse<CreateConversationResponse>(response);
}

export async function sendMessage(
	conversationId: string,
	content: string
): Promise<ApiResponse<SendMessageResponse>> {
	const response = await safeFetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ content })
	});

	if (!response) {
		return { success: false, error: "Não foi possível conectar ao servidor." };
	}

	return handleApiResponse<SendMessageResponse>(response);
}

export async function deleteConversation(conversationId: string): Promise<ApiResponse<null>> {
	const response = await safeFetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		credentials: "include"
	});

	if (!response) {
		return { success: false, error: "Não foi possível conectar ao servidor." };
	}

	return handleApiResponse<null>(response);
}
