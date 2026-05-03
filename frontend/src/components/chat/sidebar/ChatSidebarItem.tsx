import type { ChatConversation } from "../../../types/chat";
import "./ChatSidebarItem.scss";

type ChatSidebarItemProps = {
	conversation: ChatConversation;
	isActive: boolean;
	isCollapsed: boolean;
	onClick: () => void;
};

export function ChatSidebarItem(_props: ChatSidebarItemProps) {
	return null;
}
