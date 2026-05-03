import { useState, useCallback, useRef } from "react";
import type { ChatConversation, ChatMessage } from "../types/chat";
import * as chatService from "../services/chat.service";

export function useChat() {
	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [lastNewMessageId, setLastNewMessageId] = useState<string | null>(null);
	const pendingQueue = useRef<Array<{ tempId: string; content: string }>>([]);
	const processingRef = useRef(false);

	const selectConversation = useCallback(async (id: string) => {
		setActiveConversationId(id);
		setLastNewMessageId(null);
		const msgs = await chatService.getMessages(id);
		setMessages(msgs);
	}, []);

	const processQueue = useCallback(async (conversationId: string) => {
		if (processingRef.current) return;
		processingRef.current = true;

		while (pendingQueue.current.length > 0) {
			const item = pendingQueue.current[0]!;
			setIsLoading(true);

			try {
				const assistantMsg = await chatService.sendMessage(conversationId, item.content);
				setMessages((prev) => {
					const realUserId = String(Number(assistantMsg.id) - 1);
					const result: ChatMessage[] = [];
					for (const m of prev) {
						if (m.id === item.tempId) {
							result.push({ ...m, id: realUserId });
							result.push(assistantMsg);
						} else {
							result.push(m);
						}
					}
					return result;
				});
				setLastNewMessageId(assistantMsg.id);
				pendingQueue.current.shift();
			} catch {
				break;
			} finally {
				setIsLoading(false);
			}
		}

		const updatedConversations = await chatService.getConversations();
		setConversations(updatedConversations);
		processingRef.current = false;
	}, []);

	const createConversation = useCallback(async (firstMessage: string) => {
		setLastNewMessageId(null);
		setIsLoading(true);
		setMessages([{
			id: "temp-user",
			conversationId: "temp",
			role: "user",
			content: firstMessage,
			createdAt: new Date().toISOString()
		}]);

		try {
			const result = await chatService.createConversation(firstMessage);
			setConversations((prev) => [result.conversation, ...prev]);
			setActiveConversationId(result.conversation.id);
			setMessages(result.messages);

			const assistantMsg = result.messages.find((m) => m.role === "assistant");
			if (assistantMsg) setLastNewMessageId(assistantMsg.id);

			if (pendingQueue.current.length > 0) {
				processQueue(result.conversation.id);
			}
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
		setMessages((prev) => [...prev, userMsg]);

		pendingQueue.current.push({ tempId, content });
		processQueue(activeConversationId);
	}, [activeConversationId, processQueue]);

	return {
		conversations,
		activeConversationId,
		messages,
		isLoading,
		lastNewMessageId,
		selectConversation,
		createConversation,
		sendMessage
	};
}
