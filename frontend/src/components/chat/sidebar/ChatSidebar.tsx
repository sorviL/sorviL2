import { useState, useEffect } from "react";
import type { ChatConversation } from "../../../types/chat";
import { Button } from "../../button/Button";
import { ChatSidebarItem } from "./ChatSidebarItem";
import "./ChatSidebar.scss";

type ChatSidebarProps = {
	conversations: ChatConversation[];
	activeId: string | null;
	onSelect: (id: string) => void;
	onNewConversation: () => void;
	isMobile: boolean;
	isOpen: boolean;
	onClose: () => void;
};

const STORAGE_KEY = "chat-sidebar-collapsed";

export function ChatSidebar({
	conversations,
	activeId,
	onSelect,
	onNewConversation,
	isMobile,
	isOpen,
	onClose
}: ChatSidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(() => {
		if (typeof window === "undefined") return false;
		return localStorage.getItem(STORAGE_KEY) === "true";
	});

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, String(isCollapsed));
	}, [isCollapsed]);

	function handleSelect(id: string) {
		onSelect(id);
		if (isMobile) onClose();
	}

	function handleNewConversation() {
		onNewConversation();
		if (isMobile) onClose();
	}

	const sidebarClassName = [
		"chat-sidebar",
		isCollapsed && !isMobile && "chat-sidebar-collapsed",
		isMobile && "chat-sidebar-mobile",
		isMobile && isOpen && "chat-sidebar-mobile-open"
	].filter(Boolean).join(" ");

	const toggleIcon = isMobile ? "close" : isCollapsed ? "chevron_right" : "chevron_left";

	return null;
}
