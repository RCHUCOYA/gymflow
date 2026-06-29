# 12. Diseno de API REST

## Convenciones

- Base URL local futura: `http://localhost:4000/api/v1`.
- Formato: JSON.
- Autenticacion: `Authorization: Bearer <access_token>`.
- Paginacion: `?page=1&limit=20`.
- Busqueda: `?search=texto`.
- Orden: `?sort=created_at&order=desc`.

## Respuesta exitosa estandar

```json
{
  "success": true,
  "data": {},
  "message": "Operacion realizada correctamente"
}
```

## Respuesta de error estandar

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos invalidos",
    "details": []
  }
}
```

## Endpoints principales

| Modulo | Metodo | Endpoint | Roles | Descripcion |
| --- | --- | --- | --- | --- |
| System | GET | `/health` | Publico | Verificar estado operativo de la API. |
| Auth | POST | `/auth/register` | Publico | Registrar cliente. |
| Auth | POST | `/auth/login` | Publico | Iniciar sesion. |
| Auth | POST | `/auth/refresh` | Usuario | Renovar token. |
| Auth | POST | `/auth/logout` | Usuario | Cerrar sesion. |
| Auth | POST | `/auth/forgot-password` | Publico | Solicitar recuperacion. |
| Users | GET | `/users/me` | Usuario | Perfil actual. |
| Users | PATCH | `/users/me` | Usuario | Actualizar perfil. |
| Users | GET | `/users` | Admin | Listar usuarios. |
| Users | PATCH | `/users/{id}/role` | Admin | Cambiar rol. |
| Memberships | GET | `/membership-plans` | Publico | Listar planes. |
| Memberships | POST | `/memberships/purchase` | Cliente | Comprar membresia. |
| Memberships | POST | `/memberships/renew` | Cliente | Renovar membresia. |
| Memberships | GET | `/memberships/me` | Cliente | Membresia actual. |
| Rooms | GET | `/rooms` | Usuario | Listar salas. |
| Rooms | GET | `/rooms/{id}/schedules` | Usuario | Horarios de sala. |
| Reservations | POST | `/reservations` | Cliente | Reservar sala. |
| Reservations | GET | `/reservations/me` | Cliente | Mis reservas. |
| Reservations | PATCH | `/reservations/{id}/cancel` | Cliente | Cancelar reserva. |
| Trainers | GET | `/trainers` | Cliente | Listar entrenadores. |
| Trainers | POST | `/trainers/{id}/appointments` | Cliente | Reservar entrenador. |
| Nutritionists | GET | `/nutritionists` | Cliente | Listar nutricionistas. |
| Nutritionists | POST | `/nutritionists/{id}/appointments` | Cliente | Reservar nutricionista. |
| Products | GET | `/products` | Publico | Listar productos. |
| Cart | GET | `/cart` | Cliente | Ver carrito. |
| Cart | POST | `/cart/items` | Cliente | Agregar item. |
| Cart | PATCH | `/cart/items/{id}` | Cliente | Cambiar cantidad. |
| Cart | DELETE | `/cart/items/{id}` | Cliente | Eliminar item. |
| Orders | POST | `/orders/checkout` | Cliente | Confirmar compra. |
| Orders | GET | `/orders/me` | Cliente | Mis ordenes. |
| Payments | GET | `/payments/me` | Cliente | Mis pagos. |
| Dashboard | GET | `/dashboard/summary` | Admin | KPIs generales. |
| Admin | CRUD | `/admin/*` | Admin | Gestion de catalogos. |

## Codigos HTTP

- `200 OK`: consulta o actualizacion correcta.
- `201 Created`: recurso creado.
- `204 No Content`: eliminacion o revocacion sin cuerpo.
- `400 Bad Request`: entrada invalida.
- `401 Unauthorized`: token ausente o invalido.
- `403 Forbidden`: rol sin permiso.
- `404 Not Found`: recurso inexistente.
- `409 Conflict`: duplicidad, stock insuficiente o cupo completo.
- `422 Unprocessable Entity`: regla de negocio incumplida.
- `500 Internal Server Error`: error inesperado.
