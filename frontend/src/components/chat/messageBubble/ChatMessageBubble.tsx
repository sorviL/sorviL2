import { useRef, useState } from "react";
import Markdown from "react-markdown";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import type { ChatMessage } from "../../../types/chat";
import "./ChatMessageBubble.scss";

gsap.registerPlugin(SplitText);

type ChatMessageBubbleProps = {
	message: ChatMessage;
	animate?: boolean;
	pending?: boolean;
};

export function ChatMessageBubble({ message, animate = false, pending = false }: ChatMessageBubbleProps) {
	const isUser = message.role === "user";
	const [animationDone, setAnimationDone] = useState(!animate);
	const markdownRef = useRef<HTMLDivElement>(null);

	useGSAP(() => {
		if (!animate || isUser || !markdownRef.current) return;

		const split = new SplitText(markdownRef.current, {
			type: "words",
			wordsClass: "split-word"
		});

		gsap.set(markdownRef.current, { visibility: "visible" });

		gsap.fromTo(
			split.words,
			{ opacity: 0, y: 16 },
			{
				opacity: 1,
				y: 0,
				duration: 0.35,
				ease: "power3.out",
				stagger: 0.035,
				onComplete: () => {
					split.revert();
					setAnimationDone(true);
				}
			}
		);
	}, { scope: markdownRef, dependencies: [animate, isUser] });

	const bubbleClassName = [
		"chat-bubble",
		isUser ? "chat-bubble-user" : "chat-bubble-assistant",
		pending && "chat-bubble-pending"
	].filter(Boolean).join(" ");

	const needsHide = animate && !animationDone && !isUser;

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
				) : (
					<div
						ref={markdownRef}
						className="chat-bubble-markdown"
						style={needsHide ? { visibility: "hidden", overflow: "hidden" } : undefined}
					>
						<Markdown>{message.content}</Markdown>
					</div>
				)}
			</div>
		</div>
	);
}
