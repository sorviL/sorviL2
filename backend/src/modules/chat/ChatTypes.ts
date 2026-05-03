export type ConversationRecord = {
	readonly id: number;
	readonly user_id: number;
	readonly book_id: number | null;
	readonly title: string | null;
	readonly created_at: Date | string;
	readonly updated_at: Date | string;
	readonly deleted: boolean | number;
};

export type MessageRecord = {
	readonly id: number;
	readonly conversation_id: number;
	readonly role: "user" | "assistant";
	readonly content: string;
	readonly created_at: Date | string;
};

export type ConversationDto = {
	readonly id: string;
	readonly title: string;
	readonly createdAt: string;
	readonly updatedAt: string;
};

export type MessageDto = {
	readonly id: string;
	readonly conversationId: string;
	readonly role: "user" | "assistant";
	readonly content: string;
	readonly createdAt: string;
};
