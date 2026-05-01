import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { BookshelfController } from "./BookshelfController.js";
import { bookshelfService } from "./BookshelfService.js";

const controller = new BookshelfController(bookshelfService);
const bookshelfRoutes = Router();

bookshelfRoutes.get("/", requireAuth, (req, res) => controller.list(req, res));
bookshelfRoutes.get("/lookup", requireAuth, (req, res) => controller.lookup(req, res));
bookshelfRoutes.post("/", requireAuth, (req, res) => controller.add(req, res));
bookshelfRoutes.patch("/:userBookId", requireAuth, (req, res) => controller.update(req, res));
bookshelfRoutes.delete("/:userBookId", requireAuth, (req, res) => controller.remove(req, res));

export { bookshelfRoutes };
