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

	const { settled, active, queued } = useMemo(() => {
		const tempMessages = messages.filter((m) => m.id.startsWith("temp-"));
		const nonTemp = messages.filter((m) => !m.id.startsWith("temp-"));
		return {
			settled: nonTemp,
			active: tempMessages[0] ?? null,
			queued: tempMessages.slice(1)
		};
	}, [messages]);

	return (
		<div className="chat-message-list" ref={listRef}>
			{settled.map((msg) => (
				<ChatMessageBubble
					key={msg.id}
					message={msg}
					animate={msg.id === lastNewMessageId}
				/>
			))}
			{active && (
				<ChatMessageBubble key={active.id} message={active} />
			)}
			{typingIndicator}
			{queued.map((msg) => (
				<ChatMessageBubble key={msg.id} message={msg} pending />
			))}
		</div>
	);
}
