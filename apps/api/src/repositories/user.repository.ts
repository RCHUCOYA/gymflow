import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";

type UserWithRolePermissions = Prisma.PromiseReturnType<typeof findUserByEmail>;

export async function findRoleByName(name: string) {
  return prisma.role.findUnique({ where: { name } });
}

export async function findRoleById(id: string) {
  return prisma.role.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: {
            select: {
              code: true
            }
          }
        }
      }
    }
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        include: {
          permissions: {
            select: {
              code: true
            }
          }
        }
      }
    }
  });
}

export async function createUser(input: {
  roleId: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
}) {
  return prisma.user.create({
    data: input,
    include: {
      role: {
        include: {
          permissions: {
            select: {
              code: true
            }
          }
        }
      }
    }
  });
}

export async function updateCurrentUserProfile(
  userId: string,
  input: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    avatarUrl?: string | null;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
    include: {
      role: {
        include: {
          permissions: {
            select: {
              code: true
            }
          }
        }
      }
    }
  });
}

export async function listUsers(input: { page: number; limit: number; search?: string }) {
  const skip = (input.page - 1) * input.limit;

  const where: Prisma.UserWhereInput = input.search
    ? {
        OR: [
          { firstName: { contains: input.search, mode: "insensitive" } },
          { lastName: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } }
        ]
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    items,
    total,
    page: input.page,
    limit: input.limit,
    totalPages: Math.ceil(total / input.limit)
  };
}

export async function updateUserRole(userId: string, roleId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { roleId },
    include: {
      role: {
        include: {
          permissions: {
            select: {
              code: true
            }
          }
        }
      }
    }
  });
}

export async function createAuditLog(input: {
  actorUserId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({ data: input });
}

export type RepositoryUser = NonNullable<Awaited<UserWithRolePermissions>>;
