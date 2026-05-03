import "./ChatEmptyState.scss";

export function ChatEmptyState() {
	return (
		<div className="chat-empty-state">
			<span className="material-icons chat-empty-state-icon">chat_bubble_outline</span>
			<p className="chat-empty-state-text">
				Envie uma mensagem para começar uma conversa com a Lia
			</p>
		</div>
	);
}
