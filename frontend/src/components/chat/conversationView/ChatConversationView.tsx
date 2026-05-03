import { useState } from "react";
import type { ChatMessage } from "../../../types/chat";
import { ChatMessageList } from "../messageList/ChatMessageList";
import { ChatEmptyState } from "../emptyState/ChatEmptyState";
import { ChatInputBar } from "../inputBar/ChatInputBar";
import { ChatTypingIndicator } from "../typingIndicator/ChatTypingIndicator";
import { Button } from "../../button/Button";
import "./ChatConversationView.scss";

type ChatConversationViewProps = {
	messages: ChatMessage[];
	lastNewMessageId: string | null;
	onSend: (content: string) => void;
	onOpenSidebar?: () => void;
	isMobile: boolean;
};

export function ChatConversationView({
	messages,
	lastNewMessageId,
	onSend,
	onOpenSidebar,
	isMobile
}: ChatConversationViewProps) {
	const [input, setInput] = useState("");
	const hasPending = messages.some((m) => m.id.startsWith("temp-"));

	function handleSubmit(value: string) {
		onSend(value);
		setInput("");
	}

	return null;
}
