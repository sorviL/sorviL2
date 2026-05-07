import type { Request, Response } from "express";
import { validateLoginInput, validateRegisterInput } from "./auth.schemas.js";
import { getCurrentUser, loginUser, registerUser } from "./auth.service.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { emailService } from "../email/EmailService.js";

const AUTH_COOKIE_NAME = "auth_token";
const isProduction = process.env["NODE_ENV"] === "production";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "strict") as "none" | "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export async function registerController(request: Request, response: Response): Promise<void> {
  try {
    const validation = validateRegisterInput(request.body);

    if (!validation.success) {
      response.status(400).json({ message: validation.message });
      return;
    }

    const result = await registerUser(validation.data);

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.cookie(AUTH_COOKIE_NAME, result.token, COOKIE_OPTIONS);

    response.status(201).json({
      message: "Cadastro realizado com sucesso.",
      user: result.user,
    });

    emailService.sendWelcomeEmail(result.user.nickname, result.user.email)
      .catch((err) => console.error("Falha ao enviar email de boas-vindas:", err));
  } catch (err) {
    console.error("[auth.register]", err);
    response.status(500).json({ message: "Erro interno ao registrar." });
  }
}

export async function loginController(request: Request, response: Response): Promise<void> {
  try {
    const validation = validateLoginInput(request.body);

    if (!validation.success) {
      response.status(400).json({ message: validation.message });
      return;
    }

    const result = await loginUser(validation.data);

    if (!result.success) {
      response.status(result.status).json({ message: result.message });
      return;
    }

    response.cookie(AUTH_COOKIE_NAME, result.token, COOKIE_OPTIONS);

    response.status(200).json({
      message: "Login realizado com sucesso.",
      user: result.user,
    });
  } catch (err) {
    console.error("[auth.login]", err);
    response.status(500).json({ message: "Erro interno ao fazer login." });
  }
}

export async function meController(request: Request, response: Response): Promise<void> {
  try {
    const userId = (request as AuthenticatedRequest).authUser?.sub;

    if (!userId) {
      response.status(401).json({ message: "Não autenticado." });
      return;
    }

    const user = await getCurrentUser(userId);

    if (!user) {
      response.status(404).json({ message: "Usuário não encontrado." });
      return;
    }

    response.status(200).json({ user });
  } catch (err) {
    console.error("[auth.me]", err);
    response.status(500).json({ message: "Erro interno." });
  }
}

export async function logoutController(request: Request, response: Response): Promise<void> {
  response.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
    path: "/",
  });

  response.status(200).json({
    message: "Logout realizado com sucesso.",
  });
}
