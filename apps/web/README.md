# GymFlow Web

Aplicacion frontend de GymFlow construida con Next.js App Router, TypeScript, Tailwind CSS y componentes base listos para los flujos documentados.

## Scripts

- `npm run dev`: inicia servidor de desarrollo.
- `npm run build`: compila para produccion.
- `npm run start`: inicia version compilada.
- `npm run lint`: ejecuta ESLint.
- `npm run typecheck`: ejecuta TypeScript en modo estricto.

## Variables de entorno

Crear `apps/web/.env` usando `apps/web/.env.example`.

- `NEXT_PUBLIC_API_URL`: URL base de la API (ejemplo: `http://localhost:4000/api/v1`).
- `NEXT_PUBLIC_APP_NAME`: nombre publico de la aplicacion.

## Rutas iniciales disponibles

- `/`: landing publica.
- `/login`: inicio de sesion.
- `/register`: registro.
