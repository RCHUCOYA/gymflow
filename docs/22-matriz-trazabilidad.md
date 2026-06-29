# 22. Matriz de Trazabilidad

## Objetivo

Verificar que los documentos de GymFlow esten conectados entre si y que cada modulo funcional tenga relacion con requisitos, reglas de negocio, historias, casos de uso, entidades, API, UI, pruebas y arquitectura.

## Trazabilidad por modulo

| Modulo | Requisitos | Reglas | Historias | Casos de uso | Entidades | API / OpenAPI | Bruno | UI / SEO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Autenticacion | RF-001, RF-002, RF-003, RF-040, RF-042, RF-043 | RN-010, RN-011, RN-034, RN-035 | HU-001, HU-002, HU-035, HU-036 | CU-001, CU-002 | User, Role, Permission | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password` | Auth | Login, Registro, Recuperacion; no indexable |
| Usuarios y roles | RF-004, RF-005, RF-029, RF-041, RF-044 | RN-012, RN-027, RN-031, RN-032 | HU-003, HU-004, HU-031 | CU-010 | User, Role, Permission, AuditLog | `/users/me`, `/users`, `/users/{id}/role` | Users, Admin | Perfil, Admin usuarios |
| Membresias | RF-006, RF-007, RF-008, RF-009, RF-039 | RN-001, RN-008, RN-009, RN-013 | HU-005, HU-006, HU-007, HU-030 | CU-003 | MembershipPlan, UserMembership, Payment | `/membership-plans`, `/memberships/purchase`, `/memberships/renew`, `/memberships/me` | Memberships | Planes; SEO publico |
| Salas y reservas | RF-010, RF-011, RF-012, RF-013, RF-014, RF-035, RF-038 | RN-004, RN-005, RN-006, RN-007, RN-029, RN-030 | HU-009, HU-010, HU-011, HU-012, HU-029 | CU-004, CU-005 | Room, RoomSchedule, Reservation | `/rooms`, `/rooms/{roomId}/schedules`, `/reservations`, `/reservations/me`, `/reservations/{reservationId}/cancel` | Rooms, Reservations | Salas SEO; Reservas privada |
| Entrenadores | RF-015, RF-016, RF-017, RF-018 | RN-002, RN-021, RN-023 | HU-013, HU-014, HU-015, HU-016 | CU-007, CU-008 | ProfessionalProfile, Appointment, TrainingProgress | `/trainers`, `/trainers/{professionalId}/appointments` | Trainers | Entrenadores SEO; Agenda staff |
| Nutricionistas | RF-019, RF-020, RF-021, RF-022 | RN-003, RN-022, RN-024 | HU-017, HU-018, HU-019 | CU-009 | ProfessionalProfile, Appointment, NutritionPlan | `/nutritionists`, `/nutritionists/{professionalId}/appointments` | Nutritionists | Nutricionistas SEO; Agenda staff |
| Tienda y carrito | RF-021, RF-022, RF-023, RF-024, RF-025, RF-029, RF-041 | RN-015, RN-016, RN-017, RN-018, RN-028 | HU-020, HU-021, HU-022, HU-023, HU-026, HU-027 | CU-006, CU-010 | ProductCategory, Product, Cart, CartItem, Order, OrderItem, Promotion | `/products`, `/cart`, `/cart/items`, `/orders/checkout`, `/orders/me` | Products, Cart, Orders | Tienda y Producto SEO |
| Pagos | RF-026, RF-027, RF-028, RF-036 | RN-019, RN-020, RN-025 | HU-024, HU-025, HU-033 | CU-003, CU-006, CU-011 | Payment, Order, UserMembership | `/payments/me`, checkout y compra membresia | Payments, Orders, Memberships | Checkout privado |
| Dashboard | RF-035, RF-036, RF-037, RF-038, RF-039 | RN-032, RN-033 | HU-028, HU-029, HU-030 | CU-012 | Order, Payment, Reservation, UserMembership, Product | `/dashboard/summary` | Dashboard | Dashboard admin privado |
| Administracion y auditoria | RF-029, RF-030, RF-031, RF-032, RF-033, RF-034, RF-044 | RN-012, RN-013, RN-014, RN-027, RN-032, RN-036 | HU-026, HU-027, HU-031, HU-034 | CU-010 | Todas las entidades administrativas, AuditLog | `/admin/*`, `/users`, `/users/{id}/role` | Admin | Admin privado |
| SEO y marketing | RNF-014, RNF-016, RNF-021, RNF-025 | Reglas de indexacion y cache documentadas | Relacionado con conversion publica | No aplica como caso de negocio principal | Product, MembershipPlan, Room, ProfessionalProfile | Sitemap, robots, metadata | No aplica | Landing, Nosotros, Planes, Salas, Tienda, Blog |

## Relaciones transversales

- `docs/02-requisitos.md` define el contrato funcional base.
- `docs/03-reglas-de-negocio.md` convierte requisitos en restricciones operativas.
- `docs/04-historias-de-usuario.md` traduce requisitos a valor por actor.
- `docs/05-casos-de-uso.md` describe los flujos principales que luego aparecen en API y Bruno.
- `docs/06-modelo-de-dominio.md`, `docs/07-modelo-entidad-relacion.md` y `docs/08-diccionario-de-datos.md` conectan reglas con persistencia.
- `docs/12-api-rest.md` y `openapi/gymflow.yaml` son el contrato HTTP.
- `bruno/GymFlow` contiene requests representativos para probar el contrato.
- `docs/15-ui-ux.md`, `docs/20-seo-accesibilidad-optimizacion.md` y `docs/21-estandares-arquitectura-calidad.md` conectan experiencia, rutas, rendimiento, permisos y calidad.

## Hallazgos corregidos

- Se alinearon rutas publicas del frontend con la estrategia SEO: `/tienda` y `/productos/[slug]`.
- Se identifico que OpenAPI debia incluir endpoints documentados en API REST: recuperacion de contrasena, cambio de rol, renovacion de membresia y actualizacion/eliminacion de item de carrito.
- Se amplio Bruno para cubrir los endpoints faltantes del flujo principal.

