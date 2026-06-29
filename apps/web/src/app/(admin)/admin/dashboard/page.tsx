"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, DollarSign, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getDashboardSummary, type DashboardSummary } from "@/services/admin-service";

function KpiCard({
  label,
  value,
  sub,
  Icon,
  color
}: {
  label: string;
  value: string | number;
  sub?: string;
  Icon: React.ElementType;
  color: string;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={`flex size-9 items-center justify-center rounded-md ${color}`}>
          <Icon aria-hidden className="size-4" />
        </span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </article>
  );
}

function TopList({
  title,
  items,
  valueLabel
}: {
  title: string;
  items: Array<{ name: string; value: number }>;
  valueLabel: string;
}) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="mb-4 font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin datos en el periodo.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {index + 1}
                </span>
                <span className="truncate">{item.name}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                {item.value} {valueLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function AdminDashboardPage() {
  const { accessToken } = useAuth();

  const summaryQuery = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: () => getDashboardSummary(accessToken ?? ""),
    enabled: Boolean(accessToken)
  });

  const d = summaryQuery.data;

  return (
    <main className="px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen operativo del gimnasio para el mes actual.
          </p>
        </header>

        {summaryQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando indicadores...</p>
        ) : null}

        {summaryQuery.isError ? (
          <p className="text-sm text-destructive">No se pudieron cargar los indicadores.</p>
        ) : null}

        {d ? (
          <>
            <section aria-label="KPIs principales" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <KpiCard
                label="Usuarios totales"
                value={d.users.total}
                sub={`+${d.users.newClientsThisMonth} nuevos este mes`}
                Icon={Users}
                color="bg-blue-100 text-blue-700"
              />
              <KpiCard
                label="Membresias activas"
                value={d.memberships.active}
                sub={`${d.memberships.expired} vencidas`}
                Icon={ShieldCheck}
                color="bg-emerald-100 text-emerald-700"
              />
              <KpiCard
                label="Ingresos del periodo"
                value={`S/ ${d.revenue.total.toFixed(2)}`}
                sub={`Tienda: S/ ${d.revenue.orders.toFixed(2)} | Membresias: S/ ${d.revenue.memberships.toFixed(2)}`}
                Icon={DollarSign}
                color="bg-amber-100 text-amber-700"
              />
              <KpiCard
                label="Reservas hoy"
                value={d.reservations.today}
                sub={`Total periodo: ${d.reservations.total} | Canceladas: ${d.reservations.cancelled}`}
                Icon={CalendarCheck}
                color="bg-purple-100 text-purple-700"
              />
            </section>

            <section aria-label="Rankings" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TopList
                title="Productos mas vendidos"
                items={d.topProducts.map((p) => ({ name: p.name, value: p.quantitySold }))}
                valueLabel="uds"
              />
              <TopList
                title="Salas mas utilizadas"
                items={d.roomUsage.map((r) => ({ name: r.roomName, value: r.reservations }))}
                valueLabel="reservas"
              />
              <TopList
                title="Entrenadores mas activos"
                items={d.topTrainers.map((t) => ({ name: t.name, value: t.appointments }))}
                valueLabel="citas"
              />
              <TopList
                title="Nutricionistas mas activos"
                items={d.topNutritionists.map((n) => ({ name: n.name, value: n.appointments }))}
                valueLabel="citas"
              />
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-lg border bg-muted/40 p-4 text-center">
                <p className="text-xs text-muted-foreground">Ingresos tienda</p>
                <p className="mt-1 text-xl font-bold">S/ {d.revenue.orders.toFixed(2)}</p>
              </article>
              <article className="rounded-lg border bg-muted/40 p-4 text-center">
                <p className="text-xs text-muted-foreground">Ingresos membresias</p>
                <p className="mt-1 text-xl font-bold">S/ {d.revenue.memberships.toFixed(2)}</p>
              </article>
              <article className="rounded-lg border bg-muted/40 p-4 text-center">
                <p className="text-xs text-muted-foreground">Tasa cancelacion reservas</p>
                <p className="mt-1 text-xl font-bold">
                  {d.reservations.total > 0
                    ? `${((d.reservations.cancelled / d.reservations.total) * 100).toFixed(1)}%`
                    : "0%"}
                </p>
              </article>
            </section>
          </>
        ) : null}
      </main>
  );
}
