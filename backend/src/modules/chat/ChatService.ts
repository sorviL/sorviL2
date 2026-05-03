import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../../config/database.js";
import type {
	ConversationDto,
	ConversationRecord,
	CreateConversationResponse,
	MessageDto,
	MessageRecord,
	SendMessageResponse,
	ServiceResult
} from "./ChatTypes.js";

const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export class ChatService {
}

export const chatService = new ChatService();
