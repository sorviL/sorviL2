import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import db from "../../config/database.js";
import type { AuthTokenPayload, LoginInput, PublicUser, RegisterInput } from "./auth.types.js";

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

type RegisterResult =
  | { success: true; user: PublicUser; token: string }
  | { success: false; status: number; message: string };

type LoginResult =
  | { success: true; user: PublicUser; token: string }
  | { success: false; status: number; message: string };

const JWT_SECRET = process.env["JWT_SECRET"] || "dev-secret-change-me";
const JWT_EXPIRES_IN = (process.env["JWT_EXPIRES_IN"] || "7d") as StringValue;

function toIsoDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    nickname: user.nickname,
    email: user.email,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    createdAt: toIsoDate(user.created_at),
    updatedAt: toIsoDate(user.updated_at),
  };
}

function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== "object" || decoded === null) {
      return null;
    }

    const subject = Number(decoded["sub"]);
    const email = decoded["email"];
    const nickname = decoded["nickname"];

    if (!Number.isInteger(subject) || typeof email !== "string" || typeof nickname !== "string") {
      return null;
    }

    return {
      sub: subject,
      email,
      nickname,
    };
  } catch {
    return null;
  }
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const duplicatedUser = await db<UserRecord>("users")
    .where({ deleted: false })
    .andWhere((queryBuilder) => {
      queryBuilder.where("email", input.email).orWhere("nickname", input.nickname);
    })
    .first();

  if (duplicatedUser) {
    if (duplicatedUser.email === input.email) {
      return { success: false, status: 409, message: "Email já cadastrado." };
    }

    return { success: false, status: 409, message: "Nome de usuário já cadastrado." };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const insertedRows = await db("users").insert({
    nickname: input.nickname,
    email: input.email,
    password_hash: passwordHash,
  });

  const insertedId = Number(Array.isArray(insertedRows) ? insertedRows[0] : insertedRows);

  const createdUser = await db<UserRecord>("users")
    .where({ id: insertedId, deleted: false })
    .first();

  if (!createdUser) {
    return {
      success: false,
      status: 500,
      message: "Não foi possível concluir o cadastro.",
    };
  }

  const publicUser = toPublicUser(createdUser);
  const token = signToken({
    sub: publicUser.id,
    email: publicUser.email,
    nickname: publicUser.nickname,
  });

  return {
    success: true,
    user: publicUser,
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const user = await db<UserRecord>("users")
    .where({ email: input.email, deleted: false })
    .first();

  if (!user) {
    return { success: false, status: 401, message: "Credenciais inválidas." };
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);

  if (!isPasswordValid) {
    return { success: false, status: 401, message: "Credenciais inválidas." };
  }

  const publicUser = toPublicUser(user);
  const token = signToken({
    sub: publicUser.id,
    email: publicUser.email,
    nickname: publicUser.nickname,
  });

  return {
    success: true,
    user: publicUser,
    token,
  };
}

export async function getCurrentUser(userId: number): Promise<PublicUser | null> {
  const user = await db<UserRecord>("users")
    .where({ id: userId, deleted: false })
    .first();

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}
