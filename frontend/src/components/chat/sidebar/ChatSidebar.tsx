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

	return null;
}
