export type ChatMessage = {
	id: string;
	conversationId: string;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
};

export type ChatConversation = {
	id: string;
	title: string;
	createdAt: string;
	updatedAt: string;
};
