import type { Request, Response } from "express";
import { validateLoginInput, validateRegisterInput } from "./auth.schemas.js";
import { getCurrentUser, loginUser, registerUser } from "./auth.service.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

const AUTH_COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function registerController(request: Request, response: Response): Promise<void> {
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
}

export async function loginController(request: Request, response: Response): Promise<void> {
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
}

export async function meController(request: Request, response: Response): Promise<void> {
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
}

export async function logoutController(request: Request, response: Response): Promise<void> {
  response.clearCookie(AUTH_COOKIE_NAME);

  response.status(200).json({
    message: "Logout realizado com sucesso.",
  });
}
