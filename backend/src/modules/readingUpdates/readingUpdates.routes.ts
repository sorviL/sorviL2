import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { ReadingUpdatesController } from "./ReadingUpdatesController.js";
import { readingUpdatesService } from "./ReadingUpdatesService.js";

const readingUpdatesRoutes = Router();
const controller = new ReadingUpdatesController(readingUpdatesService);

readingUpdatesRoutes.post("/", requireAuth, (req, res) => controller.create(req, res));
readingUpdatesRoutes.get("/all", requireAuth, (req, res) => controller.getAll(req, res));
readingUpdatesRoutes.get("/book/:googleBooksId", requireAuth, (req, res) => controller.getByBook(req, res));
readingUpdatesRoutes.get("/latest/:googleBooksId", requireAuth, (req, res) => controller.getLatest(req, res));
readingUpdatesRoutes.delete("/:id", requireAuth, (req, res) => controller.delete(req, res));

export { readingUpdatesRoutes };
