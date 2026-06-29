import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";

export async function recordAudit(input: {
  actorUserId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({ data: input });
}
