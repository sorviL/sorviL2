import { useState } from "react";
import Markdown from "react-markdown";
import SplitText from "../../splitText/SplitText";
import type { ChatMessage } from "../../../types/chat";
import "./ChatMessageBubble.scss";

type ChatMessageBubbleProps = {
	message: ChatMessage;
	animate?: boolean;
	pending?: boolean;
};

export function ChatMessageBubble({ message, animate = false, pending = false }: ChatMessageBubbleProps) {
	const isUser = message.role === "user";
	const [animationDone, setAnimationDone] = useState(false);

	const bubbleClassName = [
		"chat-bubble",
		isUser ? "chat-bubble-user" : "chat-bubble-assistant",
		pending && "chat-bubble-pending"
	].filter(Boolean).join(" ");

	const shouldAnimate = animate && !animationDone;

	return (
		<div className={`chat-bubble-row ${isUser ? "chat-bubble-row-user" : "chat-bubble-row-assistant"}`}>
			{!isUser && (
				<div className="chat-bubble-avatar">
					<span className="material-icons">auto_awesome</span>
				</div>
			)}
			<div className={bubbleClassName}>
				{isUser ? (
					<p className="chat-bubble-text">{message.content}</p>
				) : shouldAnimate ? (
					<SplitText
						text={message.content}
						tag="p"
						className="chat-bubble-text"
						splitType="words"
						delay={40}
						duration={0.4}
						ease="power3.out"
						from={{ opacity: 0, y: 20 }}
						to={{ opacity: 1, y: 0 }}
						threshold={0.1}
						rootMargin="0px"
						textAlign="left"
						onLetterAnimationComplete={() => setAnimationDone(true)}
					/>
				) : (
					<div className="chat-bubble-markdown">
						<Markdown>{message.content}</Markdown>
					</div>
				)}
			</div>
		</div>
	);
}
