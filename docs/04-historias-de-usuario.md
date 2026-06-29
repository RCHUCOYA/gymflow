# 04. Historias de Usuario

| ID | Nombre | Actor | Prioridad | Historia | Criterios de aceptacion |
| --- | --- | --- | --- | --- | --- |
| HU-001 | Registro | Cliente | Alta | Como cliente quiero crear una cuenta para acceder a GymFlow. | Debe validar correo unico, contrasena segura y datos obligatorios. |
| HU-002 | Login | Usuario | Alta | Como usuario quiero iniciar sesion para usar funciones privadas. | Debe devolver access token, refresh token y datos basicos del perfil. |
| HU-003 | Perfil | Usuario | Media | Como usuario quiero actualizar mi perfil para mantener mis datos vigentes. | Debe permitir telefono, foto y contrasena con validacion. |
| HU-004 | Roles | Administrador | Alta | Como administrador quiero asignar roles para controlar permisos. | Solo admin puede cambiar rol y el cambio queda auditado. |
| HU-005 | Ver membresias | Cliente | Alta | Como cliente quiero ver planes para elegir el mas conveniente. | Debe mostrar precio, duracion y beneficios. |
| HU-006 | Comprar membresia | Cliente | Alta | Como cliente quiero comprar una membresia para acceder al gimnasio. | Debe crear orden, pago simulado y membresia activa si el pago confirma. |
| HU-007 | Renovar membresia | Cliente | Alta | Como cliente quiero renovar mi plan para no perder beneficios. | Debe extender fechas segun plan y registrar pago. |
| HU-008 | Validar membresia | Recepcionista | Alta | Como recepcionista quiero validar membresias para permitir ingreso. | Debe mostrar estado, vigencia y beneficios. |
| HU-009 | Ver salas | Cliente | Alta | Como cliente quiero ver salas disponibles para reservar. | Debe mostrar capacidad, estado y horarios. |
| HU-010 | Reservar sala | Cliente | Alta | Como cliente quiero reservar una sala para entrenar. | Debe impedir sobrecupo, duplicidad y membresia inactiva. |
| HU-011 | Cancelar reserva | Cliente | Media | Como cliente quiero cancelar una reserva para liberar mi cupo. | Debe cambiar estado y liberar cupo antes del inicio. |
| HU-012 | Gestionar salas | Administrador | Alta | Como administrador quiero administrar salas y horarios. | Debe permitir crear, editar, activar e inactivar. |
| HU-013 | Ver entrenadores | Cliente | Media | Como cliente quiero ver entrenadores para elegir una sesion. | Debe mostrar especialidad, disponibilidad y perfil. |
| HU-014 | Reservar entrenador | Cliente | Alta | Como cliente con beneficio quiero reservar entrenador. | Debe validar beneficio y disponibilidad. |
| HU-015 | Agenda entrenador | Entrenador | Alta | Como entrenador quiero ver mi agenda para organizar sesiones. | Debe listar citas por fecha y estado. |
| HU-016 | Progreso cliente | Entrenador | Media | Como entrenador quiero registrar progreso para hacer seguimiento. | Debe asociar observaciones a cliente y sesion. |
| HU-017 | Ver nutricionistas | Cliente | Media | Como cliente quiero ver nutricionistas disponibles. | Debe mostrar disponibilidad y perfil. |
| HU-018 | Reservar nutricionista | Cliente | Media | Como cliente Premium/VIP quiero reservar nutricionista. | Debe bloquear clientes sin beneficio. |
| HU-019 | Plan nutricional | Nutricionista | Media | Como nutricionista quiero registrar un plan para el cliente. | Debe quedar asociado al cliente y ser visible en historial. |
| HU-020 | Ver productos | Cliente | Alta | Como cliente quiero ver productos para comprar suplementos y accesorios. | Debe mostrar categoria, precio, stock y estado. |
| HU-021 | Buscar productos | Cliente | Media | Como cliente quiero buscar productos para encontrarlos rapido. | Debe filtrar por texto y categoria. |
| HU-022 | Carrito | Cliente | Alta | Como cliente quiero administrar mi carrito antes de pagar. | Debe permitir agregar, actualizar y eliminar items. |
| HU-023 | Checkout | Cliente | Alta | Como cliente quiero confirmar mi compra. | Debe validar stock y crear orden. |
| HU-024 | Pago simulado | Cliente | Alta | Como cliente quiero pagar con metodo simulado. | Debe aceptar Visa, Mastercard, Yape, Plin o Transferencia. |
| HU-025 | Historial compras | Cliente | Media | Como cliente quiero ver mis compras. | Debe listar ordenes, productos, montos y estados. |
| HU-026 | Gestionar productos | Administrador | Alta | Como administrador quiero administrar catalogo e inventario. | Debe permitir CRUD, stock y estado. |
| HU-027 | Promociones | Administrador | Media | Como administrador quiero crear promociones. | Debe definir vigencia, descuento y aplicabilidad. |
| HU-028 | Dashboard ventas | Administrador | Alta | Como administrador quiero ver ingresos para tomar decisiones. | Debe mostrar ventas por rango de fechas. |
| HU-029 | Dashboard reservas | Administrador | Alta | Como administrador quiero ver uso de salas. | Debe mostrar reservas y salas mas utilizadas. |
| HU-030 | Membresias activas | Administrador | Alta | Como administrador quiero monitorear membresias. | Debe mostrar activas, vencidas y por vencer. |
| HU-031 | Auditoria | Administrador | Media | Como administrador quiero revisar acciones sensibles. | Debe listar actor, accion, entidad y fecha. |
| HU-032 | Registrar asistencia | Recepcionista | Media | Como recepcionista quiero registrar asistencia. | Debe asociar usuario, fecha y validacion de membresia. |
| HU-033 | Pagos presenciales | Recepcionista | Media | Como recepcionista quiero registrar pagos simulados presenciales. | Debe crear comprobante interno. |
| HU-034 | Gestionar personal | Administrador | Alta | Como administrador quiero administrar entrenadores y nutricionistas. | Debe crear perfil profesional y disponibilidad. |
| HU-035 | Recuperar contrasena | Usuario | Media | Como usuario quiero recuperar mi contrasena. | Debe enviar flujo de restablecimiento y permitir cambio seguro. |
| HU-036 | Cerrar sesion | Usuario | Alta | Como usuario quiero cerrar sesion. | Debe revocar refresh token y limpiar sesion. |

