import { getOptionalStringField } from "../../shared/validation.js";
import type { UpdateProfileInput } from "./profile.types.js";

export function validateUpdateProfile(input: unknown): { success: true; data: UpdateProfileInput } | { success: false; message: string } {
  const nickname = getOptionalStringField(input, "nickname");

  if (!nickname.success) {
    return { success: false, message: nickname.message };
  }

  const bio = getOptionalStringField(input, "bio");

  if (!bio.success) {
    return { success: false, message: bio.message };
  }

  const avatarUrl = getOptionalStringField(input, "avatarUrl");

  if (!avatarUrl.success) {
    return { success: false, message: avatarUrl.message };
  }

  const data: UpdateProfileInput = {};

  if (nickname.data !== undefined) data.nickname = nickname.data;
  if (bio.data !== undefined) data.bio = bio.data;
  if (avatarUrl.data !== undefined) data.avatarUrl = avatarUrl.data;

  return {
    success: true,
    data,
  };
}
