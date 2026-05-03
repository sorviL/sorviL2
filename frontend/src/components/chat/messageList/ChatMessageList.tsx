import { useEffect, useRef, useMemo } from "react";
import type { ChatMessage } from "../../../types/chat";
import { ChatMessageBubble } from "../messageBubble/ChatMessageBubble";
import "./ChatMessageList.scss";

type ChatMessageListProps = {
	messages: ChatMessage[];
	lastNewMessageId: string | null;
	typingIndicator?: React.ReactNode;
};

export function ChatMessageList({
	messages,
	lastNewMessageId,
	typingIndicator
}: ChatMessageListProps) {
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [messages.length, typingIndicator]);

	return null;
}
