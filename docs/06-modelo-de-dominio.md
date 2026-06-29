# 06. Modelo de Dominio

## Vision general

El dominio de GymFlow se organiza alrededor de cinco nucleos: identidad, membresias, reservas, comercio y administracion. Cada nucleo tiene entidades propias, pero comparten usuarios, pagos, auditoria y estados.

## Entidades principales

| Entidad | Responsabilidad |
| --- | --- |
| User | Representa a cualquier persona con acceso al sistema. |
| Role | Define el perfil de permisos: Administrador, Recepcionista, Cliente, Entrenador, Nutricionista. |
| Permission | Define acciones autorizables dentro del sistema. |
| MembershipPlan | Define duracion, precio y beneficios comerciales. |
| UserMembership | Representa la membresia adquirida por un cliente. |
| Room | Representa una sala fisica del gimnasio. |
| RoomSchedule | Define horarios reservables por sala. |
| Reservation | Representa una reserva de sala. |
| ProfessionalProfile | Contiene informacion profesional de entrenadores y nutricionistas. |
| Appointment | Representa citas con entrenadores o nutricionistas. |
| TrainingProgress | Registra seguimiento de entrenamiento. |
| NutritionPlan | Registra planes nutricionales. |
| ProductCategory | Clasifica productos de tienda. |
| Product | Representa productos fisicos con precio y stock. |
| Cart | Agrupa items antes de confirmar compra. |
| CartItem | Producto y cantidad dentro de un carrito. |
| Order | Compra confirmada de productos. |
| OrderItem | Detalle de productos comprados. |
| Payment | Registro de pago simulado. |
| Promotion | Descuento aplicable a productos o membresias. |
| Attendance | Registro de asistencia al gimnasio. |
| AuditLog | Registro de acciones sensibles. |

## Relaciones clave

- Un `User` pertenece a un `Role`.
- Un `Role` puede tener muchos `Permission`.
- Un cliente puede tener varias `UserMembership`, pero solo una activa por periodo operativo.
- Un `MembershipPlan` puede habilitar beneficios como entrenador, nutricionista, descuentos o reservas prioritarias.
- Una `Room` tiene muchos `RoomSchedule`.
- Un `RoomSchedule` puede tener muchas `Reservation` hasta completar su capacidad.
- Un `User` cliente puede crear muchas `Reservation` y `Appointment`.
- Un `ProfessionalProfile` pertenece a un `User` con rol Entrenador o Nutricionista.
- Una `Appointment` relaciona cliente, profesional y horario.
- Un `Order` contiene varios `OrderItem` y se asocia a un `Payment`.
- Un `Payment` puede corresponder a una orden de productos o a una compra de membresia.
- `AuditLog` referencia al actor y describe la entidad afectada.

## Justificacion del modelo

El modelo separa usuarios de perfiles profesionales para evitar duplicar identidad. Las membresias se modelan como planes y adquisiciones para conservar historial comercial. Las reservas de salas y citas profesionales se separan porque tienen reglas distintas de capacidad, beneficio y responsable. La tienda conserva ordenes e items para mantener trazabilidad financiera aunque cambien precios o productos.

