import fs from "fs/promises";
import path from "path";
import db from "../../config/database.js";
import type { UpdateProfileInput, PublicUser } from "./profile.types.js";
import { getCurrentUser } from "../auth/auth.service.js";

type UserRecord = {
  id: number;
  nickname: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  deleted: number | boolean;
};

function resolveLocalAvatarPath(avatarUrl: string | null): string | null {
  if (!avatarUrl) {
    return null;
  }

  let pathname = avatarUrl;

  try {
    pathname = new URL(avatarUrl).pathname;
  } catch {
  }

  if (!pathname.startsWith("/avatars/")) {
    return null;
  }

  const filename = path.basename(pathname);

  if (!filename) {
    return null;
  }

  return path.join(process.cwd(), "public", "avatars", filename);
}

async function deleteOldAvatarFile(avatarUrl: string | null): Promise<void> {
  const filePath = resolveLocalAvatarPath(avatarUrl);

  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("Não foi possível apagar avatar antigo:", filePath);
    }
  }
}

export async function getProfile(userId: number): Promise<PublicUser | null> {
  return getCurrentUser(userId);
}

export async function updateProfile(userId: number, input: UpdateProfileInput): Promise<{ success: true; user: PublicUser } | { success: false; status: number; message: string }> {
  if (input.nickname) {
    const existing = await db<UserRecord>("users")
      .where({ deleted: false })
      .andWhere("nickname", input.nickname)
      .first();

    if (existing && existing.id !== userId) {
      return { success: false, status: 409, message: "Nome de usuário já cadastrado." };
    }
  }

  const currentUser = await db<UserRecord>("users")
    .where({ id: userId, deleted: false })
    .first();

  if (!currentUser) {
    return { success: false, status: 404, message: "Usuário não encontrado." };
  }

  const updateData: Record<string, unknown> = {};

  if (input.nickname !== undefined) updateData["nickname"] = input.nickname;
  if (input.bio !== undefined) updateData["bio"] = input.bio;
  if (input.avatarUrl !== undefined) updateData["avatar_url"] = input.avatarUrl;

  if (Object.keys(updateData).length === 0) {
    const user = await getCurrentUser(userId);
    if (!user) return { success: false, status: 404, message: "Usuário não encontrado." };
    return { success: true, user };
  }

  updateData["updated_at"] = new Date().toISOString();

  await db("users").where({ id: userId, deleted: false }).update(updateData);

  if (input.avatarUrl !== undefined && currentUser.avatar_url && currentUser.avatar_url !== input.avatarUrl) {
    await deleteOldAvatarFile(currentUser.avatar_url);
  }

  const user = await getCurrentUser(userId);

  if (!user) {
    return { success: false, status: 404, message: "Usuário não encontrado." };
  }

  return { success: true, user };
}
