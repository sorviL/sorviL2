import { Router } from "express";
import { requireAuth, optionalAuth } from "../auth/auth.middleware.js";
import { ReviewsController } from "./ReviewsController.js";
import { reviewsService } from "./ReviewsService.js";

const reviewsRoutes = Router();
const controller = new ReviewsController(reviewsService);

reviewsRoutes.post("/", requireAuth, (req, res) => controller.create(req, res));
reviewsRoutes.delete("/:id", requireAuth, (req, res) => controller.delete(req, res));
reviewsRoutes.get("/book/:googleBooksId", requireAuth, (req, res) => controller.getByBook(req, res));

reviewsRoutes.get("/all", optionalAuth, (req, res) => controller.getAll(req, res));
reviewsRoutes.get("/recent", optionalAuth, (req, res) => controller.getRecent(req, res));
reviewsRoutes.get("/stats/:googleBooksId", optionalAuth, (req, res) => controller.getStatsByGoogleBooksId(req, res));
reviewsRoutes.get("/by-book/:bookId", optionalAuth, (req, res) => controller.getByBookId(req, res));
reviewsRoutes.get("/:id", optionalAuth, (req, res) => controller.getReviewById(req, res));

export { reviewsRoutes };
