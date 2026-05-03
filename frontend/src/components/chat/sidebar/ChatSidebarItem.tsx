import type { ChatConversation } from "../../../types/chat";
import "./ChatSidebarItem.scss";

type ChatSidebarItemProps = {
	conversation: ChatConversation;
	isActive: boolean;
	isCollapsed: boolean;
	onClick: () => void;
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

export function ChatSidebarItem(_props: ChatSidebarItemProps) {
	return null;
}
