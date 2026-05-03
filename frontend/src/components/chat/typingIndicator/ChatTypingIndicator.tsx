import "./ChatTypingIndicator.scss";

export function ChatTypingIndicator() {
	return (
		<div className="chat-typing">
			<div className="chat-typing-avatar">
				<span className="material-icons">auto_awesome</span>
			</div>
			<div className="chat-typing-content">
				<div className="chat-typing-dots">
					<span className="chat-typing-dot" />
					<span className="chat-typing-dot" />
					<span className="chat-typing-dot" />
				</div>
				<span className="chat-typing-label">Lia está pensando...</span>
			</div>
		</div>
	);
}
