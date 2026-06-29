# 09. Arquitectura del Sistema

## Arquitectura fisica

```mermaid
flowchart TD
  Browser[Browser del usuario] --> Vercel[Vercel - Next.js]
  Vercel --> Render[Render - Express API]
  Render --> Neon[(Neon PostgreSQL)]
  Render --> Cloudinary[Cloudinary]
  Render --> Logs[Logs y metricas]
```

## Arquitectura logica

```mermaid
flowchart LR
  UI[UI Next.js] --> Hooks[Hooks y Forms]
  Hooks --> Client[API Client Axios]
  Client --> Controllers[Express Controllers]
  Controllers --> Middlewares[Auth, RBAC, Validation]
  Controllers --> Services[Business Services]
  Services --> Repositories[Repositories]
  Repositories --> Prisma[Prisma Client]
  Prisma --> DB[(PostgreSQL)]
```

## Arquitectura por capas

- **Presentacion:** pantallas, componentes, formularios y dashboard en Next.js.
- **Aplicacion:** hooks, servicios frontend, control de estado y manejo de errores.
- **API:** controllers Express, rutas REST y middlewares transversales.
- **Dominio:** services con reglas de negocio y validaciones de flujo.
- **Persistencia:** repositories y Prisma.
- **Infraestructura:** Neon, Cloudinary, Vercel, Render y variables de entorno.

## Flujo de autenticacion

```mermaid
sequenceDiagram
  participant U as Usuario
  participant FE as Frontend
  participant API as API
  participant DB as PostgreSQL
  U->>FE: Ingresa credenciales
  FE->>API: POST /auth/login
  API->>DB: Busca usuario y hash
  DB-->>API: Usuario
  API->>API: Valida bcrypt y permisos
  API-->>FE: Access token + refresh token
  FE-->>U: Sesion iniciada
```

## Flujo de compra y reserva

```mermaid
sequenceDiagram
  participant C as Cliente
  participant FE as Frontend
  participant API as API
  participant DB as PostgreSQL
  C->>FE: Selecciona producto o reserva
  FE->>API: Solicitud autenticada
  API->>DB: Valida membresia, stock o cupo
  DB-->>API: Resultado
  API->>DB: Crea orden/reserva y pago simulado
  API-->>FE: Confirmacion
  FE-->>C: Muestra comprobante o reserva
```

## Decisiones tecnicas

- Separar frontend y backend permite despliegues independientes y escalabilidad por capa.
- Prisma reduce errores de acceso a datos y facilita migraciones futuras.
- PostgreSQL es adecuado para integridad relacional, transacciones y reportes.
- JWT permite APIs stateless, mientras refresh token controla renovacion de sesiones.
- Cloudinary evita servir imagenes desde el backend.
- OpenAPI y Bruno convierten la API en un contrato verificable desde etapas tempranas.

