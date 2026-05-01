import type { LoginInput, RegisterInput } from "./auth.types.js";
import { type ValidationResult, getStringField } from "../../shared/validation.js";

export function validateRegisterInput(input: unknown): ValidationResult<RegisterInput> {
  const nicknameResult = getStringField(input, "nickname");
  if (!nicknameResult.success) {
    const usernameResult = getStringField(input, "username");
    if (!usernameResult.success) {
      return nicknameResult;
    }

    if (usernameResult.data.length < 3) {
      return {
        success: false,
        message: "Nome de usuário precisa ter no mínimo 3 caracteres.",
      };
    }

    const emailResult = getStringField(input, "email");
    if (!emailResult.success) {
      return emailResult;
    }

    const passwordResult = getStringField(input, "password");
    if (!passwordResult.success) {
      return passwordResult;
    }

    if (passwordResult.data.length < 6) {
      return { success: false, message: "Senha precisa ter no mínimo 6 caracteres." };
    }

    return {
      success: true,
      data: {
        nickname: usernameResult.data,
        email: emailResult.data.toLowerCase(),
        password: passwordResult.data,
      },
    };
  }

  if (nicknameResult.data.length < 3) {
    return {
      success: false,
      message: "Nome de usuário precisa ter no mínimo 3 caracteres.",
    };
  }

  const emailResult = getStringField(input, "email");
  if (!emailResult.success) {
    return emailResult;
  }

  const passwordResult = getStringField(input, "password");
  if (!passwordResult.success) {
    return passwordResult;
  }

  if (passwordResult.data.length < 6) {
    return { success: false, message: "Senha precisa ter no mínimo 6 caracteres." };
  }

  return {
    success: true,
    data: {
      nickname: nicknameResult.data,
      email: emailResult.data.toLowerCase(),
      password: passwordResult.data,
    },
  };
}

export function validateLoginInput(input: unknown): ValidationResult<LoginInput> {
  const emailResult = getStringField(input, "email");
  if (!emailResult.success) {
    return emailResult;
  }

  const passwordResult = getStringField(input, "password");
  if (!passwordResult.success) {
    return passwordResult;
  }

  return {
    success: true,
    data: {
      email: emailResult.data.toLowerCase(),
      password: passwordResult.data,
    },
  };
}
