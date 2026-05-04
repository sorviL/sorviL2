import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { bookshelfRoutes } from "./modules/bookshelf/BookshelfRoutes.js";
import { reviewsRoutes } from "./modules/reviews/reviews.routes.js";
import { chatRoutes } from "./modules/chat/ChatRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env["FRONTEND_URL"] || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_request, response) => {
  response.status(200).json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/bookshelf", bookshelfRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/chat", chatRoutes);

export default app;
