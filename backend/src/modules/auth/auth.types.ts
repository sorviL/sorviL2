export type PublicUser = {
  id: number;
  nickname: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokenPayload = {
  sub: number;
  email: string;
  nickname: string;
};

export type RegisterInput = {
  nickname: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
