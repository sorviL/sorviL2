import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { bookshelfRoutes } from "./modules/bookshelf/BookshelfRoutes.js";
import { reviewsRoutes } from "./modules/reviews/reviews.routes.js";
import { chatRoutes } from "./modules/chat/ChatRoutes.js";
import { profileRoutes } from "./modules/profile/profile.routes.js";
import { readingUpdatesRoutes } from "./modules/readingUpdates/readingUpdates.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  process.env["FRONTEND_URL"],
  "http://localhost:5173",
].filter(Boolean) as string[];

app.use(
  cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));

app.use(cookieParser());

app.use((_req, res, next) => {
  res.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
  next();
});

app.get("/health", (_request, response) => {
  response.status(200).json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/bookshelf", bookshelfRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/chat", chatRoutes);
app.use("/profile", profileRoutes);
app.use("/reading-updates", readingUpdatesRoutes);

export default app;
