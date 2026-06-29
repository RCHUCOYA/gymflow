# 11. Estructura del Frontend

## Objetivo

Disenar una aplicacion Next.js 16 con App Router, TypeScript, TailwindCSS y shadcn/ui, enfocada en flujos claros para clientes, profesionales, recepcionistas y administradores.

## Estructura propuesta

```text
apps/web/src
  app/
    (public)/
    (auth)/
    (client)/
    (admin)/
    (staff)/
  components/
  features/
  hooks/
  lib/
  providers/
  services/
  schemas/
  stores/
  types/
  utils/
```

## Responsabilidades

- `app/`: rutas, layouts y paginas por segmento de rol.
- `components/`: componentes reutilizables de UI.
- `features/`: componentes y hooks especificos por modulo.
- `hooks/`: hooks transversales.
- `lib/`: cliente Axios, TanStack Query y configuracion.
- `providers/`: AuthProvider, QueryProvider, ThemeProvider.
- `services/`: funciones que consumen la API.
- `schemas/`: validaciones Zod para formularios.
- `stores/`: estado global minimo, por ejemplo sesion o carrito.
- `types/`: contratos compartidos del frontend.
- `utils/`: formateadores, fechas y helpers.

## Rutas principales

- `/`: landing del producto.
- `/login`, `/register`, `/forgot-password`.
- `/dashboard`: vista segun rol.
- `/profile`.
- `/memberships`.
- `/rooms`, `/reservations`.
- `/trainers`, `/nutritionists`.
- `/tienda`, `/productos/[slug]`, `/cart`, `/checkout`, `/orders`.
- `/admin/users`, `/admin/products`, `/admin/rooms`, `/admin/memberships`, `/admin/reports`.
- `/staff/agenda`.

## Patrones de UI

- Formularios con React Hook Form y Zod.
- Datos remotos con TanStack Query.
- Tablas con filtros, busqueda y paginacion.
- Componentes shadcn/ui para formularios, dialogs, tabs, cards, tables y toasts.
- Iconografia con Lucide Icons.
- Graficos del dashboard con Chart.js.
