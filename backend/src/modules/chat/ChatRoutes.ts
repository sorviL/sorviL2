import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { ChatController } from "./ChatController.js";
import { chatService } from "./ChatService.js";

const controller = new ChatController(chatService);
const chatRoutes = Router();

chatRoutes.get("/conversations", requireAuth, (req, res) => controller.listConversations(req, res));
chatRoutes.post("/conversations", requireAuth, (req, res) => controller.createConversation(req, res));
chatRoutes.get("/conversations/:id/messages", requireAuth, (req, res) => controller.listMessages(req, res));
chatRoutes.post("/conversations/:id/messages", requireAuth, (req, res) => controller.sendMessage(req, res));
chatRoutes.delete("/conversations/:id", requireAuth, (req, res) => controller.deleteConversation(req, res));

export { chatRoutes };
