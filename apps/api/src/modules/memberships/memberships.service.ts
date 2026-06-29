import { PaymentMethod } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../prisma/client.js";
import { AppError } from "../../utils/app-error.js";
import { httpStatus } from "../../utils/http-status.js";

export const purchaseMembershipSchema = z.object({
  membershipPlanId: z.string().uuid(),
  paymentMethod: z.nativeEnum(PaymentMethod)
});

export async function listMembershipPlans() {
  const plans = await prisma.membershipPlan.findMany({
    where: { status: "active" },
    orderBy: { price: "asc" }
  });

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    durationDays: plan.durationDays,
    price: Number(plan.price),
    benefits: plan.benefits
  }));
}

export async function purchaseMembership(input: {
  userId: string;
  membershipPlanId: string;
  paymentMethod: PaymentMethod;
}) {
  const [plan, activeMembership] = await Promise.all([
    prisma.membershipPlan.findFirst({
      where: {
        id: input.membershipPlanId,
        status: "active"
      }
    }),
    prisma.userMembership.findFirst({
      where: {
        userId: input.userId,
        status: "active",
        endsAt: {
          gte: new Date()
        }
      },
      orderBy: {
        endsAt: "desc"
      }
    })
  ]);

  if (!plan) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Plan de membresia no encontrado");
  }

  if (activeMembership) {
    throw new AppError(
      httpStatus.unprocessableEntity,
      "BUSINESS_RULE_ERROR",
      "Ya tienes una membresia activa, usa renovacion"
    );
  }

  const now = new Date();
  const startsAt = toDateOnly(now);
  const endsAt = addDays(startsAt, plan.durationDays - 1);

  const result = await prisma.$transaction(async (tx) => {
    const userMembership = await tx.userMembership.create({
      data: {
        userId: input.userId,
        membershipPlanId: plan.id,
        startsAt,
        endsAt,
        status: "active"
      }
    });

    const payment = await tx.payment.create({
      data: {
        userId: input.userId,
        userMembershipId: userMembership.id,
        method: input.paymentMethod,
        amount: plan.price,
        status: "confirmed",
        receiptCode: buildReceiptCode()
      }
    });

    return {
      membershipId: userMembership.id,
      paymentId: payment.id,
      receiptCode: payment.receiptCode
    };
  });

  return {
    ...result,
    startsAt,
    endsAt,
    membershipPlan: {
      id: plan.id,
      name: plan.name,
      benefits: plan.benefits
    }
  };
}

export async function renewMembership(input: {
  userId: string;
  membershipPlanId: string;
  paymentMethod: PaymentMethod;
}) {
  const [plan, latestMembership] = await Promise.all([
    prisma.membershipPlan.findFirst({
      where: {
        id: input.membershipPlanId,
        status: "active"
      }
    }),
    prisma.userMembership.findFirst({
      where: {
        userId: input.userId,
        status: "active"
      },
      orderBy: {
        endsAt: "desc"
      }
    })
  ]);

  if (!plan) {
    throw new AppError(httpStatus.notFound, "NOT_FOUND", "Plan de membresia no encontrado");
  }

  const now = toDateOnly(new Date());
  const startsAt =
    latestMembership && latestMembership.endsAt >= now
      ? addDays(toDateOnly(latestMembership.endsAt), 1)
      : now;
  const endsAt = addDays(startsAt, plan.durationDays - 1);

  const result = await prisma.$transaction(async (tx) => {
    const userMembership = await tx.userMembership.create({
      data: {
        userId: input.userId,
        membershipPlanId: plan.id,
        startsAt,
        endsAt,
        status: "active"
      }
    });

    const payment = await tx.payment.create({
      data: {
        userId: input.userId,
        userMembershipId: userMembership.id,
        method: input.paymentMethod,
        amount: plan.price,
        status: "confirmed",
        receiptCode: buildReceiptCode()
      }
    });

    return {
      membershipId: userMembership.id,
      paymentId: payment.id,
      receiptCode: payment.receiptCode
    };
  });

  return {
    ...result,
    startsAt,
    endsAt,
    membershipPlan: {
      id: plan.id,
      name: plan.name,
      benefits: plan.benefits
    }
  };
}

export async function getMyMembership(userId: string) {
  const membership = await prisma.userMembership.findFirst({
    where: {
      userId
    },
    include: {
      membershipPlan: true
    },
    orderBy: {
      endsAt: "desc"
    }
  });

  if (!membership) {
    return null;
  }

  const now = toDateOnly(new Date());
  const computedStatus = membership.endsAt < now ? "expired" : membership.status;

  if (computedStatus !== membership.status) {
    await prisma.userMembership.update({
      where: { id: membership.id },
      data: { status: computedStatus }
    });
  }

  return {
    id: membership.id,
    startsAt: membership.startsAt,
    endsAt: membership.endsAt,
    status: computedStatus,
    membershipPlan: {
      id: membership.membershipPlan.id,
      name: membership.membershipPlan.name,
      durationDays: membership.membershipPlan.durationDays,
      price: Number(membership.membershipPlan.price),
      benefits: membership.membershipPlan.benefits
    }
  };
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return toDateOnly(result);
}

function toDateOnly(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildReceiptCode() {
  return `RCPT-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}
