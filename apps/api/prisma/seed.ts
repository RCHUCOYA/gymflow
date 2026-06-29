import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { PrismaClient, ProfessionalType, type Prisma } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const demoPassword = "Password123";

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const roles = await seedRoles();
  await seedPermissions(roles);
  const users = await seedUsers(roles, passwordHash);
  const plans = await seedMembershipPlans();
  const rooms = await seedRooms();
  await seedRoomSchedules(rooms);
  await seedProfessionals(users);
  const products = await seedProducts();
  await seedPromotions(plans, products);

  console.log("GymFlow seed completed successfully.");
}

async function seedRoles() {
  const roleData = [
    ["Administrador", "Control total del sistema."],
    ["Recepcionista", "Gestion operativa de reservas, asistencias y pagos presenciales."],
    ["Cliente", "Usuario final que compra membresias, reserva servicios y compra productos."],
    ["Entrenador", "Profesional que gestiona agenda y progreso de clientes."],
    ["Nutricionista", "Profesional que gestiona consultas y planes nutricionales."]
  ] as const;

  const roles = new Map<string, { id: string; name: string }>();

  for (const [name, description] of roleData) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { description },
      create: { name, description },
      select: { id: true, name: true }
    });
    roles.set(name, role);
  }

  return roles;
}

async function seedPermissions(roles: Map<string, { id: string; name: string }>) {
  const permissionCodes = [
    "users:manage",
    "roles:manage",
    "memberships:manage",
    "memberships:purchase",
    "rooms:manage",
    "reservations:manage",
    "reservations:own",
    "professionals:manage",
    "appointments:own",
    "products:manage",
    "products:read",
    "cart:own",
    "orders:own",
    "payments:own",
    "dashboard:read",
    "audit:read"
  ];

  const permissions = [];

  for (const code of permissionCodes) {
    permissions.push(
      await prisma.permission.upsert({
        where: { code },
        update: {},
        create: { code, description: `Permiso ${code}` }
      })
    );
  }

  const admin = roles.get("Administrador");
  if (admin) {
    await prisma.role.update({
      where: { id: admin.id },
      data: {
        permissions: {
          set: permissions.map((permission) => ({ id: permission.id }))
        }
      }
    });
  }
}

async function seedUsers(roles: Map<string, { id: string; name: string }>, passwordHash: string) {
  const userData = [
    {
      role: "Administrador",
      firstName: "Admin",
      lastName: "GymFlow",
      email: "admin@gymflow.dev",
      phone: "+51900000001"
    },
    {
      role: "Recepcionista",
      firstName: "Recepcion",
      lastName: "GymFlow",
      email: "recepcion@gymflow.dev",
      phone: "+51900000002"
    },
    {
      role: "Cliente",
      firstName: "Cliente",
      lastName: "Demo",
      email: "cliente@gymflow.dev",
      phone: "+51900000003"
    },
    {
      role: "Entrenador",
      firstName: "Trainer",
      lastName: "Demo",
      email: "trainer@gymflow.dev",
      phone: "+51900000004"
    },
    {
      role: "Nutricionista",
      firstName: "Nutri",
      lastName: "Demo",
      email: "nutri@gymflow.dev",
      phone: "+51900000005"
    }
  ];

  const users = new Map<string, { id: string; email: string }>();

  for (const user of userData) {
    const role = roles.get(user.role);
    if (!role) {
      throw new Error(`Missing role ${user.role}`);
    }

    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        roleId: role.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        passwordHash
      },
      create: {
        roleId: role.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        passwordHash
      },
      select: { id: true, email: true }
    });
    users.set(user.email, created);
  }

  return users;
}

async function seedMembershipPlans() {
  const plans = [
    ["Dia", 1, "25.00", { roomReservations: true }],
    ["Semanal", 7, "79.00", { roomReservations: true }],
    ["Mensual", 30, "149.00", { roomReservations: true }],
    ["Trimestral", 90, "399.00", { roomReservations: true, promotions: true }],
    ["Anual", 365, "1399.00", { roomReservations: true, promotions: true }],
    ["Premium", 30, "229.00", { roomReservations: true, trainer: true, nutritionist: true }],
    ["VIP", 30, "299.00", {
      roomReservations: true,
      trainer: true,
      nutritionist: true,
      priorityReservations: true,
      discounts: true
    }]
  ] satisfies Array<[string, number, string, Prisma.InputJsonValue]>;

  const createdPlans = new Map<string, { id: string; name: string }>();

  for (const [name, durationDays, price, benefits] of plans) {
    const plan = await prisma.membershipPlan.upsert({
      where: { name },
      update: { durationDays, price, benefits },
      create: { name, durationDays, price, benefits },
      select: { id: true, name: true }
    });
    createdPlans.set(name, plan);
  }

  return createdPlans;
}

async function seedRooms() {
  const roomData = [
    ["Sala de pesas", 40],
    ["Sala de boxeo", 24],
    ["Sala de baile", 30],
    ["Sala de pilates", 18],
    ["Sala funcional", 25],
    ["Sala de crossfit", 22],
    ["Sala de yoga", 20]
  ] as const;

  const rooms = [];

  for (const [name, capacity] of roomData) {
    rooms.push(
      await prisma.room.upsert({
        where: { name },
        update: { capacity },
        create: { name, capacity }
      })
    );
  }

  return rooms;
}

async function seedRoomSchedules(rooms: Awaited<ReturnType<typeof seedRooms>>) {
  const baseDate = "2026-07-01";
  const hours = ["06:00", "07:00", "08:00", "09:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

  for (const room of rooms) {
    for (const hour of hours) {
      const startsAt = new Date(`${baseDate}T${hour}:00-05:00`);
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

      const existing = await prisma.roomSchedule.findFirst({
        where: {
          roomId: room.id,
          startsAt
        }
      });

      if (!existing) {
        await prisma.roomSchedule.create({
          data: {
            roomId: room.id,
            startsAt,
            endsAt,
            quota: room.capacity
          }
        });
      }
    }
  }
}

async function seedProfessionals(users: Map<string, { id: string; email: string }>) {
  const professionals = [
    {
      email: "trainer@gymflow.dev",
      type: ProfessionalType.trainer,
      specialty: "Fuerza e hipertrofia",
      bio: "Entrenador especializado en fuerza, recomposicion corporal y seguimiento progresivo."
    },
    {
      email: "nutri@gymflow.dev",
      type: ProfessionalType.nutritionist,
      specialty: "Nutricion deportiva",
      bio: "Nutricionista enfocada en rendimiento, habitos saludables y planes sostenibles."
    }
  ];

  for (const professional of professionals) {
    const user = users.get(professional.email);
    if (!user) {
      throw new Error(`Missing professional user ${professional.email}`);
    }

    await prisma.professionalProfile.upsert({
      where: { userId: user.id },
      update: {
        type: professional.type,
        specialty: professional.specialty,
        bio: professional.bio
      },
      create: {
        userId: user.id,
        type: professional.type,
        specialty: professional.specialty,
        bio: professional.bio
      }
    });
  }
}

async function seedProducts() {
  const categories = [
    ["Proteinas", ["Whey Protein", "Isolate Protein"]],
    ["Creatina", ["Creatina monohidratada"]],
    ["Pre Workout", ["Pre entreno energia"]],
    ["BCAA", ["Aminoacidos BCAA"]],
    ["Bebidas", ["Agua mineral", "Bebida isotonica", "Bebida proteinica"]],
    ["Accesorios", ["Shaker", "Guantes", "Toalla", "Straps", "Banda elastica"]]
  ] as const;

  const createdProducts = new Map<string, { id: string; name: string }>();

  for (const [categoryName, productNames] of categories) {
    const category = await prisma.productCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName }
    });

    for (const productName of productNames) {
      const product = await prisma.product.upsert({
        where: { slug: slugify(productName) },
        update: {
          categoryId: category.id,
          price: "89.90",
          stock: 50
        },
        create: {
          categoryId: category.id,
          name: productName,
          slug: slugify(productName),
          description: `${productName} disponible en la tienda GymFlow.`,
          price: "89.90",
          stock: 50
        },
        select: { id: true, name: true }
      });
      createdProducts.set(productName, product);
    }
  }

  return createdProducts;
}

async function seedPromotions(
  plans: Map<string, { id: string; name: string }>,
  products: Map<string, { id: string; name: string }>
) {
  const trimestral = plans.get("Trimestral");
  const whey = products.get("Whey Protein");

  if (trimestral) {
    await upsertPromotionByName({
      name: "10% membresia trimestral",
      description: "Descuento demo para membresia trimestral.",
      discountPercent: "10.00",
      targetType: "membership_plan",
      membershipPlanId: trimestral.id,
      startsAt: new Date("2026-07-01T00:00:00-05:00"),
      endsAt: new Date("2026-12-31T23:59:59-05:00")
    });
  }

  if (whey) {
    await upsertPromotionByName({
      name: "15% producto destacado VIP",
      description: "Descuento demo para producto seleccionado.",
      discountPercent: "15.00",
      targetType: "product",
      productId: whey.id,
      startsAt: new Date("2026-07-01T00:00:00-05:00"),
      endsAt: new Date("2026-12-31T23:59:59-05:00")
    });
  }
}

async function upsertPromotionByName(input: Prisma.PromotionUncheckedCreateInput) {
  const existing = await prisma.promotion.findFirst({
    where: { name: input.name },
    select: { id: true }
  });

  if (existing) {
    await prisma.promotion.update({
      where: { id: existing.id },
      data: {
        description: input.description,
        discountPercent: input.discountPercent,
        targetType: input.targetType,
        productId: input.productId,
        membershipPlanId: input.membershipPlanId,
        startsAt: input.startsAt,
        endsAt: input.endsAt
      }
    });
    return;
  }

  await prisma.promotion.create({ data: input });
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
