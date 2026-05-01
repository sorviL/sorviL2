import type { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "./auth.service.js";
import type { AuthTokenPayload } from "./auth.types.js";

type AuthenticatedRequest = Request & {
  authUser?: AuthTokenPayload;
};

export function requireAuth(request: Request, response: Response, next: NextFunction): void {
  const token = request.cookies["auth_token"];

  if (!token) {
    response.status(401).json({ message: "Token de autenticação ausente." });
    return;
  }

  const decodedToken = verifyAuthToken(token);

  if (!decodedToken) {
    response.status(401).json({ message: "Token de autenticação inválido." });
    return;
  }

  (request as AuthenticatedRequest).authUser = decodedToken;
  next();
}

export type { AuthenticatedRequest };
