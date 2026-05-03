import type { ChatConversation, ChatMessage } from "../types/chat";

let nextId = 1;
function uid(): string {
	return String(nextId++);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
