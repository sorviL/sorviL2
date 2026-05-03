import { type ValidationResult, getStringField } from "../../shared/validation.js";
import type { CreateConversationInput, SendMessageInput } from "./ChatTypes.js";

export function validateCreateConversationInput(input: unknown): ValidationResult<CreateConversationInput> {
	const messageResult = getStringField(input, "message");

	if (!messageResult.success) {
		return messageResult;
	}

	return {
		success: true,
		data: {
			message: messageResult.data
		}
	};
}

export function validateSendMessageInput(input: unknown): ValidationResult<SendMessageInput> {
	const contentResult = getStringField(input, "content");

	if (!contentResult.success) {
		return contentResult;
	}

	return {
		success: true,
		data: {
			content: contentResult.data
		}
	};
}
