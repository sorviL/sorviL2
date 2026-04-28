import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  registerController,
} from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get("/me", requireAuth, meController);
authRoutes.post("/logout", logoutController);

export { authRoutes };
