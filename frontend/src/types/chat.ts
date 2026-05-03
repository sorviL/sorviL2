export type ChatMessage = {
	id: string;
	conversationId: string;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
};
