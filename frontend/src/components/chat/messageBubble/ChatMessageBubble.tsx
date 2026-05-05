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

		const listItems = markdownRef.current.querySelectorAll<HTMLLIElement>("li");
		listItems.forEach(li => { li.style.listStyleType = "none"; });

		gsap.set(markdownRef.current, { visibility: "visible" });

		const revealedLis = new Set<HTMLLIElement>();
		const tl = gsap.timeline({
			onComplete: () => {
				listItems.forEach(li => { li.style.listStyleType = ""; });
				split.revert();
				setAnimationDone(true);
			}
		});

		(split.words as HTMLElement[]).forEach((word, i) => {
			tl.fromTo(word,
				{ opacity: 0, y: 16 },
				{
					opacity: 1,
					y: 0,
					duration: 0.35,
					ease: "power3.out",
					onStart: () => {
						const li = word.closest("li") as HTMLLIElement | null;
						if (li && !revealedLis.has(li)) {
							revealedLis.add(li);
							gsap.set(li, { listStyleType: "" });
						}
					}
				},
				i * 0.035
			);
		});
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
