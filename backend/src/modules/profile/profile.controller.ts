import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { getProfile, updateProfile } from "./profile.service.js";
import { validateUpdateProfile } from "./profile.schemas.js";

export async function getProfileController(request: Request, response: Response) {
  const authReq = request as AuthenticatedRequest;
  const authUser = authReq.authUser;

  if (!authUser) {
    return response.status(401).json({ message: "Não autenticado." });
  }

  const user = await getProfile(authUser.sub);

  if (!user) {
    return response.status(404).json({ message: "Usuário não encontrado." });
  }

  return response.status(200).json({ user });
}

export async function updateProfileController(request: Request, response: Response) {
  const authReq = request as AuthenticatedRequest;
  const authUser = authReq.authUser;

  if (!authUser) {
    return response.status(401).json({ message: "Não autenticado." });
  }

  const validation = validateUpdateProfile(request.body);

  if (!validation.success) {
    return response.status(400).json({ message: validation.message });
  }

  const result = await updateProfile(authUser.sub, validation.data);

  if (!result.success) {
    return response.status(result.status).json({ message: result.message });
  }

  return response.status(200).json({ user: result.user });
}

export async function uploadAvatarController(request: Request, response: Response) {
  const authReq = request as AuthenticatedRequest;
  const authUser = authReq.authUser;

  if (!authUser) {
    return response.status(401).json({ message: "Não autenticado." });
  }

  const file = (request as any).file;

  if (!file) {
    return response.status(400).json({ message: "Arquivo não fornecido." });
  }

  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!allowedMimes.includes(file.mimetype)) {
    return response.status(400).json({ message: "Tipo de arquivo inválido. Use JPG, PNG, WebP ou GIF." });
  }

  if (file.size > 5 * 1024 * 1024) {
    return response.status(400).json({ message: "Arquivo muito grande. Máximo 5MB." });
  }

  const apiUrl = process.env["API_URL"] || "http://localhost:3000";
  const avatarUrl = `${apiUrl}/avatars/${file.filename}`;

  const result = await updateProfile(authUser.sub, { avatarUrl });

  if (!result.success) {
    return response.status(result.status).json({ message: result.message });
  }

  return response.status(200).json({ user: result.user });
}

