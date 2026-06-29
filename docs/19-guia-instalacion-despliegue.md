# 19. Guia de Instalacion y Despliegue

## Objetivo

Documentar el proceso real para levantar GymFlow en entornos de desarrollo y produccion.

## Arquitectura de despliegue

| Componente | Plataforma |
| --- | --- |
| Frontend Next.js | Vercel |
| Backend Express.js | Render |
| Base de datos PostgreSQL | Neon |
| Imagenes | Cloudinary |
| API Contract | OpenAPI |
| Pruebas API | Bruno |

---

## Desarrollo local

### Prerequisitos

- Node.js >= 20.11.0
- npm >= 10.0.0
- Cuenta Neon con base de datos PostgreSQL creada

### 1. Clonar e instalar

```bash
git clone https://github.com/<org>/gym-system02.git
cd gym-system02
npm install
```

### 2. Variables de entorno backend

Copia `apps/api/.env.example` → `apps/api/.env` y completa:

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/gymflow?sslmode=require
JWT_ACCESS_SECRET=un-secreto-aleatorio-de-al-menos-32-caracteres
JWT_REFRESH_SECRET=otro-secreto-aleatorio-de-al-menos-32-caracteres
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Variables de entorno frontend

Copia `apps/web/.env.example` → `apps/web/.env.local` y completa:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_NAME=GymFlow
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Base de datos

```bash
# Genera el cliente Prisma
npm run db:generate -w @gymflow/api

# Aplica la migración inicial
npm run db:migrate:dev -w @gymflow/api

# Carga el seed con datos demo
npm run db:seed -w @gymflow/api
```

### 5. Levantar en desarrollo

```bash
# Backend (puerto 4000)
npm run dev:api

# Frontend (puerto 3000) en otra terminal
npm run dev:web
```

### 6. Verificar

```bash
# Health check
curl http://localhost:4000/api/v1/health

# Suite de pruebas
npm run test:api
```

---

## Produccion — Neon

1. Crear proyecto en [neon.tech](https://neon.tech).
2. Crear una rama `main` para produccion y `dev` para desarrollo.
3. Copiar la `DATABASE_URL` del pooler de produccion.
4. Ejecutar migración desde CI/CD o manualmente:

```bash
DATABASE_URL=<neon-production-url> npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

5. Ejecutar seed en produccion (solo una vez):

```bash
DATABASE_URL=<neon-production-url> npm run db:seed -w @gymflow/api
```

---

## Produccion — Render

1. Importar el repositorio en [render.com](https://render.com).
2. Render detecta `render.yaml` automaticamente y configura el servicio.
3. Configurar las variables de entorno secretas en el panel de Render:

| Variable | Descripcion |
| --- | --- |
| `DATABASE_URL` | Conexion Neon produccion (pooler URL). |
| `JWT_ACCESS_SECRET` | Secreto aleatorio >= 32 caracteres. |
| `JWT_REFRESH_SECRET` | Secreto aleatorio >= 32 caracteres (distinto del anterior). |
| `CORS_ORIGIN` | URL publica de Vercel. Ej: `https://gymflow.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Nombre de cuenta Cloudinary. |
| `CLOUDINARY_API_KEY` | API key de Cloudinary. |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary. |

4. El comando de build es `npm install && npm run build`.
5. El comando de start es `node dist/server.js`.
6. Health check: `GET /api/v1/health`.

---

## Produccion — Vercel

1. Importar el repositorio en [vercel.com](https://vercel.com).
2. Vercel detecta `vercel.json` automaticamente.
3. Configurar las variables de entorno en el panel de Vercel:

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL de Render. Ej: `https://gymflow-api.onrender.com/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | `GymFlow` |
| `NEXT_PUBLIC_SITE_URL` | URL publica de Vercel. Ej: `https://gymflow.vercel.app` |

4. Deploy automatico desde la rama `main`.

---

## Produccion — Cloudinary

1. Crear cuenta en [cloudinary.com](https://cloudinary.com).
2. Crear carpetas: `gymflow/profiles`, `gymflow/products`, `gymflow/trainers`, `gymflow/nutritionists`.
3. Copiar `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` a las variables de Render.

---

## Variables de entorno — Resumen

### Backend (`apps/api/.env`)

| Variable | Requerida | Descripcion |
| --- | --- | --- |
| `NODE_ENV` | Si | `development`, `test` o `production` |
| `PORT` | Si | Puerto del servidor. Default: `4000` |
| `DATABASE_URL` | Si | Conexion PostgreSQL Neon |
| `JWT_ACCESS_SECRET` | Si | Secreto access token >= 16 chars |
| `JWT_REFRESH_SECRET` | Si | Secreto refresh token >= 16 chars |
| `JWT_ACCESS_EXPIRES_IN` | No | Default: `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Default: `7d` |
| `CORS_ORIGIN` | Si | URL del frontend en produccion |
| `CLOUDINARY_CLOUD_NAME` | No | Solo si se implementa upload de imagenes |
| `CLOUDINARY_API_KEY` | No | Solo si se implementa upload de imagenes |
| `CLOUDINARY_API_SECRET` | No | Solo si se implementa upload de imagenes |

### Frontend (`apps/web/.env.local`)

| Variable | Requerida | Descripcion |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Si | URL base de la API |
| `NEXT_PUBLIC_APP_NAME` | No | Nombre de la app. Default: `GymFlow` |
| `NEXT_PUBLIC_SITE_URL` | Si | URL publica del frontend (para SEO) |

---

## CI/CD — GitHub Actions

El workflow `.github/workflows/ci.yml` ejecuta en cada push a `main` y `develop`:

1. Lint
2. Typecheck
3. Build
4. API integration tests (requiere `DATABASE_URL_CI` y secretos JWT en GitHub Secrets)

---

## Usuarios demo para evaluacion

Todos los usuarios tienen password: `Password123`

| Email | Rol | Acceso |
| --- | --- | --- |
| `admin@gymflow.dev` | Administrador | Dashboard, admin, usuarios, reportes |
| `recepcion@gymflow.dev` | Recepcionista | Validacion de membresias |
| `cliente@gymflow.dev` | Cliente | Membresias, reservas, tienda, citas |
| `trainer@gymflow.dev` | Entrenador | Agenda propia, progreso de clientes |
| `nutri@gymflow.dev` | Nutricionista | Agenda propia, planes nutricionales |

## Checklist de despliegue

- OpenAPI actualizado.
- Variables configuradas en Vercel y Render.
- Migraciones aplicadas.
- Seed ejecutado en entorno demo.
- Bruno prueba login, membresia, reserva, carrito, checkout y dashboard.
- CORS permite solo dominios esperados.
- No existen secretos en el repositorio.

