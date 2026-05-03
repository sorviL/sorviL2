import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { ReviewsController } from "./ReviewsController.js";
import { reviewsService } from "./ReviewsService.js";

const reviewsRoutes = Router();
const controller = new ReviewsController(reviewsService);

reviewsRoutes.post("/", requireAuth, (req, res) => controller.create(req, res));
reviewsRoutes.get("/book/:googleBooksId", requireAuth, (req, res) => controller.getByBook(req, res));

reviewsRoutes.get("/all", (req, res) => controller.getAll(req, res));
reviewsRoutes.get("/recent", (req, res) => controller.getRecent(req, res));
reviewsRoutes.get("/by-book/:bookId", (req, res) => controller.getByBookId(req, res));
reviewsRoutes.get("/:id", (req, res) => controller.getReviewById(req, res));

export { reviewsRoutes };
