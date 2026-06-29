import { z } from "zod";
import {
  createUser,
  findRoleByName,
  findUserByEmail,
  findUserById
} from "../../repositories/user.repository.js";
import { AppError } from "../../utils/app-error.js";
import { httpStatus } from "../../utils/http-status.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import {
  hasRefreshToken,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  saveRefreshToken
} from "./refresh-token-store.js";

export const registerSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  password: z.string().min(8).max(128),
  phone: z.string().min(7).max(30).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(10).optional()
});

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    permissions: string[];
  };
};

export async function register(payload: z.infer<typeof registerSchema>): Promise<AuthResponse> {
  const existingUser = await findUserByEmail(payload.email);
  if (existingUser) {
    throw new AppError(httpStatus.conflict, "CONFLICT", "El correo ya se encuentra registrado");
  }

  const clientRole = await findRoleByName("Cliente");
  if (!clientRole) {
    throw new AppError(
      httpStatus.internalServerError,
      "CONFIGURATION_ERROR",
      "No existe el rol Cliente"
    );
  }

  const passwordHash = await hashPassword(payload.password);
  const createPayload = {
    roleId: clientRole.id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    passwordHash,
    ...(payload.phone ? { phone: payload.phone } : {})
  };

  const createdUser = await createUser(createPayload);

  return buildAuthResponse(createdUser);
}

export async function login(payload: z.infer<typeof loginSchema>): Promise<AuthResponse> {
  const user = await findUserByEmail(payload.email);
  if (!user) {
    throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Credenciales invalidas");
  }

  const passwordIsValid = await verifyPassword(payload.password, user.passwordHash);
  if (!passwordIsValid) {
    throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Credenciales invalidas");
  }

  return buildAuthResponse(user);
}

export async function refresh(refreshToken: string): Promise<Pick<AuthResponse, "accessToken" | "refreshToken">> {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload.sub || !hasRefreshToken(payload.sub, refreshToken)) {
    throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Refresh token invalido o revocado");
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    throw new AppError(httpStatus.unauthorized, "UNAUTHORIZED", "Usuario no encontrado");
  }

  revokeRefreshToken(user.id, refreshToken);

  const permissions = user.role.permissions.map((permission) => permission.code);
  const nextPayload = {
    sub: user.id,
    role: user.role.name,
    permissions
  };

  const nextAccessToken = signAccessToken(nextPayload);
  const nextRefreshToken = signRefreshToken(nextPayload);

  saveRefreshToken(user.id, nextRefreshToken);

  return {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken
  };
}

export function logout(userId: string, refreshToken?: string) {
  if (refreshToken) {
    revokeRefreshToken(userId, refreshToken);
    return;
  }

  revokeAllRefreshTokens(userId);
}

export function forgotPassword(_email: string) {
  return {
    accepted: true
  };
}

function buildAuthResponse(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
    permissions: Array<{ code: string }>;
  };
}): AuthResponse {
  const permissions = user.role.permissions.map((permission) => permission.code);

  const payload = {
    sub: user.id,
    role: user.role.name,
    permissions
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  saveRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name,
      permissions
    }
  };
}
