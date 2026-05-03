import { type ValidationResult, getStringField } from "../../shared/validation.js";
import type { CreateConversationInput } from "./ChatTypes.js";

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
