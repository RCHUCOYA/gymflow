import { prisma } from "../../prisma/client.js";

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfDay(date: Date) {
  const d = startOfDay(date);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

function endOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

export async function getDashboardSummary(params?: { from?: string; to?: string }) {
  const now = new Date();
  const from = params?.from ? new Date(params.from) : startOfMonth(now);
  const to = params?.to ? new Date(params.to) : endOfMonth(now);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);

  const [
    totalUsers,
    newClientsThisMonth,
    activeMemberships,
    expiredMemberships,
    revenueOrders,
    revenueMemberships,
    reservationsToday,
    totalReservationsInRange,
    cancelledReservationsInRange,
    topProducts,
    roomUsage,
    trainerAppointments,
    nutritionistAppointments
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: { name: "Cliente" },
        createdAt: { gte: monthStart }
      }
    }),
    prisma.userMembership.count({
      where: { status: "active", endsAt: { gte: now } }
    }),
    prisma.userMembership.count({ where: { status: "expired" } }),
    prisma.payment.aggregate({
      where: {
        status: "confirmed",
        orderId: { not: null },
        createdAt: { gte: from, lte: to }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: "confirmed",
        userMembershipId: { not: null },
        createdAt: { gte: from, lte: to }
      },
      _sum: { amount: true }
    }),
    prisma.reservation.count({
      where: {
        status: "confirmed",
        createdAt: { gte: todayStart, lt: todayEnd }
      }
    }),
    prisma.reservation.count({
      where: { createdAt: { gte: from, lte: to } }
    }),
    prisma.reservation.count({
      where: { status: "cancelled", createdAt: { gte: from, lte: to } }
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
      where: {
        order: {
          status: "confirmed",
          createdAt: { gte: from, lte: to }
        }
      }
    }),
    prisma.reservation.groupBy({
      by: ["roomScheduleId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
      where: {
        status: "confirmed",
        createdAt: { gte: from, lte: to }
      }
    }),
    prisma.appointment.groupBy({
      by: ["professionalProfileId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 3,
      where: {
        professionalProfile: { type: "trainer" },
        createdAt: { gte: from, lte: to }
      }
    }),
    prisma.appointment.groupBy({
      by: ["professionalProfileId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 3,
      where: {
        professionalProfile: { type: "nutritionist" },
        createdAt: { gte: from, lte: to }
      }
    })
  ]);

  const totalRevenue =
    Number(revenueOrders._sum.amount ?? 0) + Number(revenueMemberships._sum.amount ?? 0);

  // Enrich top products with names
  const productIds = topProducts.map((tp) => tp.productId);
  const productDetails = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true }
  });
  const productMap = new Map(productDetails.map((p) => [p.id, p.name]));

  // Enrich room usage with names
  const scheduleIds = roomUsage.map((r) => r.roomScheduleId);
  const scheduleDetails = await prisma.roomSchedule.findMany({
    where: { id: { in: scheduleIds } },
    include: { room: { select: { id: true, name: true } } }
  });
  const scheduleRoomMap = new Map(scheduleDetails.map((s) => [s.id, s.room.name]));

  // Enrich trainer/nutritionist with names
  const trainerProfileIds = trainerAppointments.map((a) => a.professionalProfileId);
  const nutritionistProfileIds = nutritionistAppointments.map((a) => a.professionalProfileId);

  const professionalDetails = await prisma.professionalProfile.findMany({
    where: { id: { in: [...trainerProfileIds, ...nutritionistProfileIds] } },
    include: { user: { select: { firstName: true, lastName: true } } }
  });
  const professionalMap = new Map(
    professionalDetails.map((p) => [
      p.id,
      `${p.user.firstName} ${p.user.lastName}`
    ])
  );

  return {
    period: { from: from.toISOString(), to: to.toISOString() },
    users: {
      total: totalUsers,
      newClientsThisMonth
    },
    memberships: {
      active: activeMemberships,
      expired: expiredMemberships
    },
    revenue: {
      total: Math.round(totalRevenue * 100) / 100,
      orders: Math.round(Number(revenueOrders._sum.amount ?? 0) * 100) / 100,
      memberships: Math.round(Number(revenueMemberships._sum.amount ?? 0) * 100) / 100
    },
    reservations: {
      today: reservationsToday,
      total: totalReservationsInRange,
      cancelled: cancelledReservationsInRange
    },
    topProducts: topProducts.map((tp) => ({
      productId: tp.productId,
      name: productMap.get(tp.productId) ?? "Desconocido",
      quantitySold: tp._sum.quantity ?? 0
    })),
    roomUsage: roomUsage.map((r) => ({
      roomScheduleId: r.roomScheduleId,
      roomName: scheduleRoomMap.get(r.roomScheduleId) ?? "Desconocida",
      reservations: r._count.id
    })),
    topTrainers: trainerAppointments.map((a) => ({
      professionalProfileId: a.professionalProfileId,
      name: professionalMap.get(a.professionalProfileId) ?? "Desconocido",
      appointments: a._count.id
    })),
    topNutritionists: nutritionistAppointments.map((a) => ({
      professionalProfileId: a.professionalProfileId,
      name: professionalMap.get(a.professionalProfileId) ?? "Desconocido",
      appointments: a._count.id
    }))
  };
}
