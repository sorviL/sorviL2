import { useState, useCallback, useRef } from "react";
import type { ChatConversation, ChatMessage } from "../types/chat";
import * as chatService from "../services/chat.service";

export function useChat() {
	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [lastNewMessageId, setLastNewMessageId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const pendingQueue = useRef<Array<{ tempId: string; content: string }>>([]);
	const processingRef = useRef(false);

	const loadConversations = useCallback(async () => {
		const result = await chatService.getConversations();
		if (result.success) {
			setConversations(result.data);
		}
	}, []);

	const selectConversation = useCallback(async (id: string) => {
		setActiveConversationId(id);
		setLastNewMessageId(null);
		const result = await chatService.getMessages(id);
		if (result.success) {
			setMessages(result.data);
		}
	}, []);

	const processQueue = useCallback(async (conversationId: string) => {
		if (processingRef.current) return;
		processingRef.current = true;

		while (pendingQueue.current.length > 0) {
			const item = pendingQueue.current[0]!;
			setIsLoading(true);
			setError(null);

			try {
				const result = await chatService.sendMessage(conversationId, item.content);

				if (!result.success) {
					console.error("[useChat] sendMessage failed:", result.error);
					setError(result.error);
					break;
				}

				const { userMessage, assistantMessage } = result.data;

				setMessages((prev) => {
					const updated: ChatMessage[] = [];
					for (const m of prev) {
						if (m.id === item.tempId) {
							updated.push({ ...m, id: userMessage.id });
							updated.push(assistantMessage);
						} else {
							updated.push(m);
						}
					}
					return updated;
				});

				setLastNewMessageId(assistantMessage.id);
				pendingQueue.current.shift();
			} catch (err) {
				console.error("[useChat] sendMessage error:", err);
				setError("Erro ao enviar mensagem. Tente novamente.");
				break;
			} finally {
				setIsLoading(false);
			}
		}

		await loadConversations();
		processingRef.current = false;
	}, [loadConversations]);

	const createConversation = useCallback(async (firstMessage: string) => {
		setLastNewMessageId(null);
		setIsLoading(true);
		setError(null);
		setMessages([{
			id: "temp-user",
			conversationId: "temp",
			role: "user",
			content: firstMessage,
			createdAt: new Date().toISOString()
		}]);

		try {
			const result = await chatService.createConversation(firstMessage);

			if (!result.success) {
				console.error("[useChat] createConversation failed:", result.error);
				setError(result.error);
				setMessages([]);
				return;
			}

			const { conversation, userMessage, assistantMessage } = result.data;

			setConversations((prev) => [conversation, ...prev]);
			setActiveConversationId(conversation.id);
			setMessages([userMessage, assistantMessage]);
			setLastNewMessageId(assistantMessage.id);

			if (pendingQueue.current.length > 0) {
				processQueue(conversation.id);
			}
		} catch (err) {
			console.error("[useChat] createConversation error:", err);
			setError("Erro ao criar conversa. Tente novamente.");
			setMessages([]);
		} finally {
			setIsLoading(false);
		}
	}, [processQueue]);

	const sendMessage = useCallback((content: string) => {
		if (!activeConversationId) return;

		const tempId = "temp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
		const userMsg: ChatMessage = {
			id: tempId,
			conversationId: activeConversationId,
			role: "user",
			content,
			createdAt: new Date().toISOString()
		};
		setLastNewMessageId(null);
		setError(null);
		setMessages((prev) => [...prev, userMsg]);

		pendingQueue.current.push({ tempId, content });
		processQueue(activeConversationId);
	}, [activeConversationId, processQueue]);

	const deleteConversation = useCallback(async (id: string): Promise<boolean> => {
		const result = await chatService.deleteConversation(id);

		if (!result.success) return false;

		setConversations((prev) => prev.filter((c) => c.id !== id));

		if (activeConversationId === id) {
			pendingQueue.current = [];
			processingRef.current = false;
			setActiveConversationId(null);
			setMessages([]);
			setLastNewMessageId(null);
		}

		return true;
	}, [activeConversationId]);

	const startNewConversation = useCallback(() => {
		pendingQueue.current = [];
		processingRef.current = false;
		setActiveConversationId(null);
		setMessages([]);
		setLastNewMessageId(null);
	}, []);

	const clearError = useCallback(() => setError(null), []);

	return {
		conversations,
		activeConversationId,
		messages,
		isLoading,
		lastNewMessageId,
		error,
		loadConversations,
		selectConversation,
		createConversation,
		sendMessage,
		deleteConversation,
		startNewConversation,
		clearError
	};
}
