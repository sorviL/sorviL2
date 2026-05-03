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

	return {
		conversations,
		activeConversationId,
		messages,
		isLoading,
		lastNewMessageId,
		selectConversation
	};
}
