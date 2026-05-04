import type { PublicUser } from "../auth/auth.types.js";

export type UpdateProfileInput = {
  nickname?: string | undefined;
  bio?: string | null | undefined;
  avatarUrl?: string | null | undefined;
};

export type { PublicUser };
