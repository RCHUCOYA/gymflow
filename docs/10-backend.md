# 10. Estructura del Backend

## Objetivo

Disenar una API REST con Express.js, TypeScript y Prisma que mantenga separacion de responsabilidades, reglas de negocio testeables y control de seguridad por rol.

## Estructura propuesta

```text
apps/api/src
  config/
  controllers/
  services/
  repositories/
  routes/
  middlewares/
  validators/
  dtos/
  types/
  interfaces/
  utils/
  modules/
  prisma/
  app.ts
  server.ts
```

## Responsabilidades

- `config/`: lectura validada de variables de entorno, CORS, Cloudinary, JWT y constantes.
- `controllers/`: reciben HTTP, extraen parametros, invocan services y responden JSON.
- `services/`: contienen reglas de negocio, transacciones y orquestacion.
- `repositories/`: encapsulan consultas Prisma.
- `routes/`: declaran endpoints y middlewares por recurso.
- `middlewares/`: autenticacion, autorizacion, errores, rate limit, auditoria y validacion.
- `validators/`: reglas Express Validator o schemas equivalentes.
- `dtos/`: tipos de entrada y salida de casos de uso.
- `types/`: extensiones globales, tipos de token y payloads.
- `utils/`: helpers puros como paginacion, respuestas, fechas y comprobantes.
- `modules/`: agrupacion opcional por dominio cuando el proyecto crezca.

## Principios de diseno

- Controllers delgados.
- Services con reglas de negocio explicitas.
- Repositories sin logica de negocio.
- DTOs para no exponer modelos internos directamente.
- Errores de dominio convertidos a HTTP por middleware central.
- Operaciones de stock, cupo y pago simuladas dentro de transacciones.

## Modulos backend

- `auth`: registro, login, refresh, logout y recuperacion.
- `users`: perfil, roles, administracion de usuarios.
- `memberships`: planes, compras, renovaciones y beneficios.
- `rooms`: salas, horarios, aforo y reservas.
- `professionals`: entrenadores, nutricionistas, agendas y citas.
- `store`: categorias, productos, carrito, ordenes e inventario.
- `payments`: pagos simulados y comprobantes.
- `dashboard`: metricas agregadas.
- `audit`: registro de acciones sensibles.

