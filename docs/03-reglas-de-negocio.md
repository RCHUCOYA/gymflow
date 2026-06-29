# 03. Reglas de Negocio

| ID | Regla |
| --- | --- |
| RN-001 | No se permite reservar una sala sin membresia activa. |
| RN-002 | No se permite reservar entrenador si la membresia no incluye ese beneficio. |
| RN-003 | Solo membresias Premium o VIP pueden reservar nutricionista. |
| RN-004 | Una sala no puede superar su capacidad maxima por horario. |
| RN-005 | Un cliente no puede tener dos reservas en el mismo horario. |
| RN-006 | Una reserva cancelada libera el cupo correspondiente. |
| RN-007 | Una reserva solo puede cancelarse antes de la hora de inicio. |
| RN-008 | Una membresia vencida no habilita reservas ni beneficios. |
| RN-009 | La renovacion de una membresia extiende la vigencia segun el plan comprado. |
| RN-010 | Un usuario no puede registrarse con un correo ya existente. |
| RN-011 | La contrasena debe almacenarse cifrada con bcrypt. |
| RN-012 | Solo administradores pueden cambiar roles. |
| RN-013 | Solo administradores pueden crear, editar o eliminar planes de membresia. |
| RN-014 | Solo administradores pueden crear, editar o eliminar productos. |
| RN-015 | El stock de un producto nunca puede ser negativo. |
| RN-016 | Una compra solo se confirma si existe stock suficiente. |
| RN-017 | El precio de una orden debe calcularse desde el precio vigente de productos o membresias. |
| RN-018 | Una promocion vencida no puede aplicarse a nuevas compras. |
| RN-019 | Un pago simulado debe quedar asociado a una orden o compra de membresia. |
| RN-020 | Todo pago confirmado debe generar un comprobante interno. |
| RN-021 | Un entrenador no puede tener dos citas en el mismo horario. |
| RN-022 | Un nutricionista no puede tener dos citas en el mismo horario. |
| RN-023 | Solo entrenadores pueden registrar progreso de entrenamiento. |
| RN-024 | Solo nutricionistas pueden registrar planes nutricionales. |
| RN-025 | El recepcionista puede validar membresias, pero no modificar precios. |
| RN-026 | El recepcionista puede registrar asistencia presencial. |
| RN-027 | Las operaciones administrativas relevantes deben registrarse en auditoria. |
| RN-028 | Un producto inactivo no se muestra en la tienda publica. |
| RN-029 | Una sala inactiva no puede recibir nuevas reservas. |
| RN-030 | Los horarios cerrados o bloqueados no aceptan reservas. |
| RN-031 | El cliente solo puede ver su propio historial de compras, pagos y reservas. |
| RN-032 | El administrador puede consultar historiales globales. |
| RN-033 | Los reportes deben respetar filtros de fecha. |
| RN-034 | Los refresh tokens revocados no pueden reutilizarse. |
| RN-035 | La sesion debe invalidarse cuando el refresh token expire o sea revocado. |
| RN-036 | La eliminacion logica se preferira para entidades historicas con relaciones financieras. |

