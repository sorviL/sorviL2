import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { ReviewsController } from "./ReviewsController.js";
import { reviewsService } from "./ReviewsService.js";

const reviewsRoutes = Router();
const controller = new ReviewsController(reviewsService);

reviewsRoutes.post("/", requireAuth, (req, res) => controller.create(req, res));
reviewsRoutes.get('/book/:googleBooksId', requireAuth, (req, res) => controller.getByBook(req, res));

export { reviewsRoutes };
