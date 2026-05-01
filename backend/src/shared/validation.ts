export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export function isValidObject(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}

export function getStringField(input: unknown, fieldName: string): ValidationResult<string> {
  if (!isValidObject(input)) {
    return { success: false, message: "Corpo da requisição inválido." };
  }

  const value = input[fieldName];

  if (typeof value !== "string") {
    return { success: false, message: `Campo ${fieldName} é obrigatório.` };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return { success: false, message: `Campo ${fieldName} é obrigatório.` };
  }

  return { success: true, data: trimmed };
}

export function getOptionalStringField(input: unknown, fieldName: string): ValidationResult<string | undefined> {
  if (!isValidObject(input)) {
    return { success: false, message: "Corpo da requisição inválido." };
  }

  const value = input[fieldName];

  if (value === undefined || value === null) {
    return { success: true, data: undefined };
  }

  if (typeof value !== "string") {
    return { success: false, message: `Campo ${fieldName} deve ser uma string.` };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return { success: true, data: undefined };
  }

  return { success: true, data: trimmed };
}

export function getNumberField(input: unknown, fieldName: string): ValidationResult<number> {
  if (!isValidObject(input)) {
    return { success: false, message: "Corpo da requisição inválido." };
  }

  const value = input[fieldName];

  if (typeof value !== "number" || Number.isNaN(value)) {
    return { success: false, message: `Campo ${fieldName} é obrigatório e deve ser um número.` };
  }

  return { success: true, data: value };
}

export function getOptionalNumberField(input: unknown, fieldName: string): ValidationResult<number | undefined> {
  if (!isValidObject(input)) {
    return { success: false, message: "Corpo da requisição inválido." };
  }

  const value = input[fieldName];

  if (value === undefined || value === null) {
    return { success: true, data: undefined };
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    return { success: false, message: `Campo ${fieldName} deve ser um número.` };
  }

  return { success: true, data: value };
}

export function getBooleanField(input: unknown, fieldName: string): ValidationResult<boolean> {
  if (!isValidObject(input)) {
    return { success: false, message: "Corpo da requisição inválido." };
  }

  const value = input[fieldName];

  if (typeof value !== "boolean") {
    return { success: false, message: `Campo ${fieldName} é obrigatório e deve ser booleano.` };
  }

  return { success: true, data: value };
}

export function getOptionalBooleanField(input: unknown, fieldName: string): ValidationResult<boolean | undefined> {
  if (!isValidObject(input)) {
    return { success: false, message: "Corpo da requisição inválido." };
  }

  const value = input[fieldName];

  if (value === undefined || value === null) {
    return { success: true, data: undefined };
  }

  if (typeof value !== "boolean") {
    return { success: false, message: `Campo ${fieldName} deve ser booleano.` };
  }

  return { success: true, data: value };
}

export function getArrayField<T>(input: unknown, fieldName: string, itemValidator: (item: unknown) => item is T): ValidationResult<T[]> {
  if (!isValidObject(input)) {
    return { success: false, message: "Corpo da requisição inválido." };
  }

  const value = input[fieldName];

  if (!Array.isArray(value)) {
    return { success: false, message: `Campo ${fieldName} é obrigatório e deve ser um array.` };
  }

  if (!value.every(itemValidator)) {
    return { success: false, message: `Campo ${fieldName} contém itens inválidos.` };
  }

  return { success: true, data: value };
}
