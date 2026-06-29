# 19. Guia de Instalacion y Despliegue

## Objetivo

Definir el proceso previsto para levantar GymFlow cuando se implemente el frontend, backend, Prisma y base de datos. Este documento no instala dependencias ni ejecuta codigo actualmente; sirve como guia operativa para la siguiente fase.

## Arquitectura de despliegue

| Componente | Plataforma |
| --- | --- |
| Frontend Next.js | Vercel |
| Backend Express.js | Render |
| Base de datos PostgreSQL | Neon |
| Imagenes | Cloudinary |
| API Contract | OpenAPI |
| Pruebas API | Bruno |

## Preparacion local futura

1. Crear estructura de monorepo con `apps/web` y `apps/api`.
2. Instalar dependencias del frontend y backend.
3. Crear base de datos Neon para desarrollo.
4. Configurar variables de entorno en cada aplicacion.
5. Crear schema Prisma basado en el modelo ER documentado.
6. Ejecutar migraciones.
7. Ejecutar seed siguiendo el plan de datos iniciales.
8. Levantar backend y frontend.
9. Probar endpoints con Bruno.

## Variables de entorno backend

| Variable | Descripcion |
| --- | --- |
| `NODE_ENV` | Entorno: development, test o production. |
| `PORT` | Puerto del backend. |
| `DATABASE_URL` | Conexion PostgreSQL Neon. |
| `JWT_ACCESS_SECRET` | Secreto para access tokens. |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens. |
| `JWT_ACCESS_EXPIRES_IN` | Duracion del access token. |
| `JWT_REFRESH_EXPIRES_IN` | Duracion del refresh token. |
| `CORS_ORIGIN` | URL publica del frontend. |
| `CLOUDINARY_CLOUD_NAME` | Nombre de Cloudinary. |
| `CLOUDINARY_API_KEY` | API key de Cloudinary. |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary. |

## Variables de entorno frontend

| Variable | Descripcion |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base de la API. |
| `NEXT_PUBLIC_APP_NAME` | Nombre visible de la aplicacion. |

## Neon

- Crear proyecto PostgreSQL.
- Crear una rama para desarrollo y otra para produccion.
- Copiar `DATABASE_URL` al backend.
- Activar backups o snapshots cuando el proyecto pase a produccion.

## Cloudinary

- Crear carpetas logicas: `profiles`, `products`, `trainers`, `nutritionists`.
- Configurar transformaciones de imagen para tamanos de avatar y catalogo.
- Mantener credenciales solo en el backend.

## Render

- Crear Web Service para el backend.
- Configurar variables privadas.
- Definir comando de build TypeScript.
- Definir comando de start para produccion.
- Habilitar logs y health check.

## Vercel

- Crear proyecto para el frontend.
- Configurar `NEXT_PUBLIC_API_URL` apuntando a Render.
- Revisar dominios permitidos en CORS del backend.
- Activar preview deployments para ramas.

## Checklist de despliegue

- OpenAPI actualizado.
- Variables configuradas en Vercel y Render.
- Migraciones aplicadas.
- Seed ejecutado en entorno demo.
- Bruno prueba login, membresia, reserva, carrito, checkout y dashboard.
- CORS permite solo dominios esperados.
- No existen secretos en el repositorio.

