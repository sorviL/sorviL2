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

	return (
		<div className="chat-conversation-view">
			{isMobile && (
				<div className="chat-conversation-topbar">
					<Button
						icon="menu"
						onClick={onOpenSidebar}
						className="chat-conversation-menu"
					/>
					<span className="chat-conversation-topbar-title">Lia</span>
				</div>
			)}

			{messages.length === 0 ? (
				<ChatEmptyState />
			) : (
				<ChatMessageList
					messages={messages}
					lastNewMessageId={lastNewMessageId}
					typingIndicator={hasPending ? <ChatTypingIndicator /> : undefined}
				/>
			)}

			<div className="chat-conversation-input">
				<ChatInputBar
					value={input}
					onChange={setInput}
					onSubmit={handleSubmit}
					placeholder="Digite uma mensagem..."
				/>
			</div>
		</div>
	);
}
