export type PublicUser = {
  id: number;
  nickname: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPayload = {
  nickname: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  user: PublicUser;
};

export type ErrorResponse = {
  message: string;
};
