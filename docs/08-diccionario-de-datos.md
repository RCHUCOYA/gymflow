# 08. Diccionario de Datos

## Convenciones

- `uuid`: identificador unico.
- `varchar(n)`: texto con longitud maxima.
- `numeric(10,2)`: monto monetario.
- `timestamptz`: fecha y hora con zona horaria.
- Estados recomendados: `active`, `inactive`, `pending`, `confirmed`, `cancelled`, `expired`.

## users

| Campo | Tipo | Obligatorio | Default | Descripcion |
| --- | --- | --- | --- | --- |
| id | uuid | Si | generated | Identificador del usuario. |
| role_id | uuid | Si | - | Rol asignado. |
| first_name | varchar(80) | Si | - | Nombre. |
| last_name | varchar(120) | Si | - | Apellidos. |
| email | varchar(160) | Si | - | Correo unico. |
| password_hash | varchar(255) | Si | - | Hash bcrypt. |
| phone | varchar(30) | No | null | Telefono. |
| birth_date | date | No | null | Fecha de nacimiento. |
| avatar_url | varchar(500) | No | null | Imagen Cloudinary. |
| status | varchar(20) | Si | active | Estado del usuario. |
| created_at | timestamptz | Si | now | Fecha de creacion. |
| updated_at | timestamptz | Si | now | Fecha de actualizacion. |

## roles / permissions

| Tabla | Campo | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| roles | id | uuid | Si | Identificador. |
| roles | name | varchar(60) | Si | Nombre unico del rol. |
| roles | description | varchar(255) | No | Descripcion. |
| permissions | id | uuid | Si | Identificador. |
| permissions | code | varchar(120) | Si | Codigo unico de permiso. |
| permissions | description | varchar(255) | No | Descripcion. |

## membership_plans / user_memberships

| Tabla | Campo | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| membership_plans | id | uuid | Si | Identificador del plan. |
| membership_plans | name | varchar(80) | Si | Nombre del plan. |
| membership_plans | duration_days | int | Si | Duracion en dias. |
| membership_plans | price | numeric(10,2) | Si | Precio. |
| membership_plans | benefits | jsonb | Si | Beneficios habilitados. |
| membership_plans | status | varchar(20) | Si | Estado del plan. |
| user_memberships | id | uuid | Si | Identificador. |
| user_memberships | user_id | uuid | Si | Cliente. |
| user_memberships | membership_plan_id | uuid | Si | Plan adquirido. |
| user_memberships | starts_at | date | Si | Inicio de vigencia. |
| user_memberships | ends_at | date | Si | Fin de vigencia. |
| user_memberships | status | varchar(20) | Si | Estado de membresia. |

## rooms / room_schedules / reservations

| Tabla | Campo | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| rooms | id | uuid | Si | Identificador. |
| rooms | name | varchar(100) | Si | Nombre de sala. |
| rooms | capacity | int | Si | Aforo maximo. |
| rooms | status | varchar(20) | Si | Estado. |
| room_schedules | id | uuid | Si | Identificador. |
| room_schedules | room_id | uuid | Si | Sala. |
| room_schedules | starts_at | timestamptz | Si | Inicio del horario. |
| room_schedules | ends_at | timestamptz | Si | Fin del horario. |
| room_schedules | quota | int | Si | Cupos reservables. |
| reservations | id | uuid | Si | Identificador. |
| reservations | user_id | uuid | Si | Cliente. |
| reservations | room_schedule_id | uuid | Si | Horario reservado. |
| reservations | status | varchar(20) | Si | Estado de reserva. |

## professional_profiles / appointments

| Tabla | Campo | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| professional_profiles | id | uuid | Si | Identificador. |
| professional_profiles | user_id | uuid | Si | Usuario profesional. |
| professional_profiles | type | varchar(30) | Si | trainer o nutritionist. |
| professional_profiles | specialty | varchar(120) | No | Especialidad. |
| professional_profiles | bio | text | No | Biografia. |
| appointments | id | uuid | Si | Identificador. |
| appointments | client_id | uuid | Si | Cliente. |
| appointments | professional_profile_id | uuid | Si | Profesional. |
| appointments | starts_at | timestamptz | Si | Inicio. |
| appointments | ends_at | timestamptz | Si | Fin. |
| appointments | status | varchar(20) | Si | Estado. |

## products / orders / payments

| Tabla | Campo | Tipo | Obligatorio | Descripcion |
| --- | --- | --- | --- | --- |
| product_categories | id | uuid | Si | Identificador. |
| product_categories | name | varchar(80) | Si | Categoria. |
| products | id | uuid | Si | Identificador. |
| products | category_id | uuid | Si | Categoria. |
| products | name | varchar(140) | Si | Nombre. |
| products | price | numeric(10,2) | Si | Precio. |
| products | stock | int | Si | Unidades disponibles. |
| products | image_url | varchar(500) | No | Imagen. |
| orders | id | uuid | Si | Identificador. |
| orders | user_id | uuid | Si | Cliente. |
| orders | total | numeric(10,2) | Si | Total. |
| orders | status | varchar(20) | Si | Estado. |
| order_items | id | uuid | Si | Identificador. |
| order_items | order_id | uuid | Si | Orden. |
| order_items | product_id | uuid | Si | Producto. |
| order_items | quantity | int | Si | Cantidad. |
| order_items | unit_price | numeric(10,2) | Si | Precio historico. |
| payments | id | uuid | Si | Identificador. |
| payments | method | varchar(30) | Si | Visa, Mastercard, Yape, Plin o Transferencia. |
| payments | amount | numeric(10,2) | Si | Monto. |
| payments | status | varchar(20) | Si | Estado. |
| payments | receipt_code | varchar(80) | Si | Comprobante interno. |

## audit_logs

| Campo | Tipo | Obligatorio | Default | Descripcion |
| --- | --- | --- | --- | --- |
| id | uuid | Si | generated | Identificador. |
| actor_user_id | uuid | Si | - | Usuario que ejecuta la accion. |
| action | varchar(120) | Si | - | Accion realizada. |
| entity | varchar(120) | Si | - | Entidad afectada. |
| entity_id | uuid | No | null | Identificador afectado. |
| metadata | jsonb | No | null | Datos complementarios. |
| created_at | timestamptz | Si | now | Fecha del evento. |

