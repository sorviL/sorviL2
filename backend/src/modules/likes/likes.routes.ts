import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { LikesController } from "./LikesController.js";
import { likesService } from "./LikesService.js";

const likesRoutes = Router();
const controller = new LikesController(likesService);

likesRoutes.post("/review/:id", requireAuth, (req, res) => controller.toggleReviewLike(req, res));
likesRoutes.post("/update/:id", requireAuth, (req, res) => controller.toggleUpdateLike(req, res));

export { likesRoutes };
