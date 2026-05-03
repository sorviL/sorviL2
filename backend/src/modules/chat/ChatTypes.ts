export type ConversationRecord = {
	readonly id: number;
	readonly user_id: number;
	readonly book_id: number | null;
	readonly title: string | null;
	readonly created_at: Date | string;
	readonly updated_at: Date | string;
	readonly deleted: boolean | number;
};
