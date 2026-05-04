import type { ChatConversation } from "../../../types/chat";
import "./ChatSidebarItem.scss";

type ChatSidebarItemProps = {
	conversation: ChatConversation;
	isActive: boolean;
	isCollapsed: boolean;
	onClick: () => void;
	onDelete: () => void;
};

function formatRelativeDate(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Hoje";
	if (diffDays === 1) return "Ontem";
	if (diffDays < 7) return `${diffDays} dias atrás`;
	return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function ChatSidebarItem({
	conversation,
	isActive,
	isCollapsed,
	onClick,
	onDelete
}: ChatSidebarItemProps) {
	const className = [
		"chat-sidebar-item",
		isActive && "chat-sidebar-item-active"
	].filter(Boolean).join(" ");

	if (isCollapsed) {
		return (
			<button
				type="button"
				className={className}
				onClick={onClick}
				title={conversation.title}
			>
				<span className="material-icons chat-sidebar-item-icon">chat_bubble</span>
			</button>
		);
	}

	function handleDelete(e: React.MouseEvent) {
		e.stopPropagation();
		onDelete();
	}

	return (
		<button type="button" className={className} onClick={onClick}>
			<div className="chat-sidebar-item-content">
				<span className="chat-sidebar-item-title">{conversation.title}</span>
				<span className="chat-sidebar-item-date">
					{formatRelativeDate(conversation.updatedAt)}
				</span>
			</div>
			<span
				className="material-icons chat-sidebar-item-delete"
				onClick={handleDelete}
				role="button"
				tabIndex={0}
				title="Excluir conversa"
			>
				delete
			</span>
		</button>
	);
}
