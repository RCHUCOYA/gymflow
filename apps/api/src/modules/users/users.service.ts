import { z } from "zod";
import {
  createAuditLog,
  findRoleById,
  findUserById,
  listUsers,
  updateCurrentUserProfile,
  updateUserRole
} from "../../repositories/user.repository.js";
import { AppError } from "../../utils/app-error.js";
import { httpStatus } from "../../utils/http-status.js";

export const updateMeSchema = z.object({
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(120).optional(),
  phone: z.string().min(7).max(30).optional(),
  avatarUrl: z.string().url().max(500).optional()
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional()
});

export const updateRoleSchema = z.object({
  roleId: z.string().uuid()
});

export async function getCurrentUser(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Usuario no encontrado");
  }

  return toUserResponse(user);
}

export async function updateMe(userId: string, payload: z.infer<typeof updateMeSchema>) {
  const updatePayload = {
    ...(payload.firstName ? { firstName: payload.firstName } : {}),
    ...(payload.lastName ? { lastName: payload.lastName } : {}),
    ...(payload.phone ? { phone: payload.phone } : {}),
    ...(payload.avatarUrl ? { avatarUrl: payload.avatarUrl } : {})
  };

  const user = await updateCurrentUserProfile(userId, {
    ...updatePayload
  });

  return toUserResponse(user);
}

export async function listAllUsers(payload: z.infer<typeof listUsersQuerySchema>) {
  const users = await listUsers({
    page: payload.page,
    limit: payload.limit,
    ...(payload.search ? { search: payload.search } : {})
  });

  return {
    items: users.items.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt
    })),
    page: users.page,
    limit: users.limit,
    total: users.total,
    totalPages: users.totalPages
  };
}

export async function changeUserRole(input: { actorUserId: string; userId: string; roleId: string }) {
  const [targetUser, role] = await Promise.all([findUserById(input.userId), findRoleById(input.roleId)]);

  if (!targetUser) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Usuario no encontrado");
  }

  if (!role) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Rol no encontrado");
  }

  const updatedUser = await updateUserRole(input.userId, input.roleId);

  await createAuditLog({
    actorUserId: input.actorUserId,
    action: "users.role.updated",
    entity: "User",
    entityId: updatedUser.id,
    metadata: {
      oldRoleId: targetUser.roleId,
      newRoleId: role.id,
      newRoleName: role.name
    }
  });

  return {
    id: updatedUser.id,
    role: {
      id: updatedUser.role.id,
      name: updatedUser.role.name
    }
  };
}

function toUserResponse(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: {
    id: string;
    name: string;
    permissions: Array<{ code: string }>;
  };
  status: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: {
      id: user.role.id,
      name: user.role.name
    },
    permissions: user.role.permissions.map((permission) => permission.code),
    status: user.status,
    createdAt: user.createdAt
  };
}
