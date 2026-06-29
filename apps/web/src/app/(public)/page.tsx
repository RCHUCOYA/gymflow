import Link from "next/link";
import { Activity, BarChart3, CalendarCheck, ShoppingBag, ShieldCheck } from "lucide-react";

const modules = [
  {
    title: "Membresias",
    description: "Planes, renovaciones y beneficios validados automaticamente.",
    icon: ShieldCheck
  },
  {
    title: "Reservas",
    description: "Salas, horarios y aforo controlado para evitar duplicidades.",
    icon: CalendarCheck
  },
  {
    title: "Tienda",
    description: "Productos, carrito, checkout e inventario listo para crecer.",
    icon: ShoppingBag
  },
  {
    title: "Dashboard",
    description: "Indicadores de ventas, reservas, membresias y productos.",
    icon: BarChart3
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
        <nav className="flex items-center justify-between gap-4" aria-label="Principal">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity aria-hidden="true" className="size-5" />
            </span>
            GymFlow
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Registrarse
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
              Plataforma SaaS fitness
            </p>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Gestion integral para gimnasios modernos.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Centraliza usuarios, membresias, reservas, entrenadores, nutricionistas, tienda,
              pagos simulados y reportes administrativos en una experiencia web profesional.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-md bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Crear cuenta demo
              </Link>
              <Link
                href="/login"
                className="rounded-md border px-5 py-3 text-center text-sm font-semibold transition hover:bg-muted"
              >
                Acceder al sistema
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="grid gap-4">
              {modules.map((module) => {
                const Icon = module.icon;

                return (
                  <article key={module.title} className="rounded-md border bg-background p-4">
                    <div className="flex items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div>
                        <h2 className="font-semibold">{module.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
