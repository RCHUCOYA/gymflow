import Link from "next/link";
import { BarChart3, LayoutDashboard, Package, Percent, ScrollText, ShoppingBag, Dumbbell } from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", Icon: Dumbbell },
  { href: "/admin/products", label: "Productos", Icon: Package },
  { href: "/admin/promotions", label: "Promociones", Icon: Percent },
  { href: "/admin/rooms", label: "Salas", Icon: BarChart3 },
  { href: "/admin/plans", label: "Planes", Icon: ShoppingBag },
  { href: "/admin/audit", label: "Auditoria", Icon: ScrollText }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r bg-card md:block">
        <div className="px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Panel admin
          </p>
        </div>
        <nav aria-label="Menu administrativo">
          <ul className="space-y-0.5 px-2">
            {links.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Icon aria-hidden className="size-4 text-muted-foreground" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
