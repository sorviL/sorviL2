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

export function ChatSidebar(_props: ChatSidebarProps) {
	return null;
}
