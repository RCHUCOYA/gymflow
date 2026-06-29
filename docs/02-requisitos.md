# 02. Requisitos

## Requerimientos funcionales

| ID | Modulo | Requerimiento |
| --- | --- | --- |
| RF-001 | Usuarios | El sistema permitira registrar usuarios con nombre, apellidos, correo, contrasena, telefono y fecha de nacimiento. |
| RF-002 | Usuarios | El sistema permitira iniciar sesion con correo y contrasena. |
| RF-003 | Usuarios | El sistema permitira solicitar recuperacion de contrasena por correo. |
| RF-004 | Usuarios | El usuario podra consultar y actualizar su perfil. |
| RF-005 | Usuarios | El administrador podra asignar roles a usuarios. |
| RF-006 | Membresias | El sistema mostrara planes de membresia con beneficios, duracion y precio. |
| RF-007 | Membresias | El cliente podra comprar una membresia. |
| RF-008 | Membresias | El cliente podra renovar una membresia vencida o proxima a vencer. |
| RF-009 | Membresias | El sistema validara beneficios antes de permitir servicios restringidos. |
| RF-010 | Salas | El cliente podra consultar salas disponibles. |
| RF-011 | Salas | El cliente podra consultar horarios por sala. |
| RF-012 | Salas | El cliente podra reservar un horario de sala disponible. |
| RF-013 | Salas | El cliente podra cancelar una reserva dentro del plazo permitido. |
| RF-014 | Salas | El sistema impedira reservas que excedan el aforo. |
| RF-015 | Entrenadores | El cliente podra consultar entrenadores y especialidades. |
| RF-016 | Entrenadores | El cliente con beneficio habilitado podra reservar entrenador. |
| RF-017 | Entrenadores | El entrenador podra consultar su agenda. |
| RF-018 | Entrenadores | El entrenador podra registrar progreso y observaciones. |
| RF-019 | Nutricionistas | El cliente podra consultar nutricionistas disponibles. |
| RF-020 | Nutricionistas | El cliente Premium o VIP podra reservar nutricionista. |
| RF-021 | Nutricionistas | El nutricionista podra consultar su agenda. |
| RF-022 | Nutricionistas | El nutricionista podra registrar planes nutricionales. |
| RF-023 | Tienda | El sistema mostrara productos por categoria. |
| RF-024 | Tienda | El usuario podra buscar productos por nombre o categoria. |
| RF-025 | Tienda | El usuario podra agregar productos al carrito. |
| RF-026 | Tienda | El usuario podra modificar cantidades del carrito. |
| RF-027 | Tienda | El usuario podra eliminar productos del carrito. |
| RF-028 | Tienda | El usuario podra confirmar una compra. |
| RF-029 | Inventario | El sistema descontara stock despues de una compra confirmada. |
| RF-030 | Pagos | El usuario podra seleccionar metodo de pago simulado. |
| RF-031 | Pagos | El sistema registrara el pago y generara comprobante interno. |
| RF-032 | Pagos | El usuario podra consultar historial de pagos. |
| RF-033 | Admin | El administrador podra gestionar usuarios. |
| RF-034 | Admin | El administrador podra gestionar productos. |
| RF-035 | Admin | El administrador podra gestionar salas. |
| RF-036 | Admin | El administrador podra configurar horarios y cupos. |
| RF-037 | Admin | El administrador podra gestionar promociones. |
| RF-038 | Admin | El administrador podra gestionar entrenadores y nutricionistas. |
| RF-039 | Dashboard | El sistema mostrara estadisticas de reservas por periodo. |
| RF-040 | Dashboard | El sistema mostrara ingresos por membresias y tienda. |
| RF-041 | Dashboard | El sistema mostrara productos mas vendidos. |
| RF-042 | Dashboard | El sistema mostrara salas mas utilizadas. |
| RF-043 | Dashboard | El sistema mostrara membresias activas, vencidas y por vencer. |
| RF-044 | Seguridad | El sistema autenticara usuarios mediante JWT. |
| RF-045 | Seguridad | El sistema autorizara acciones segun rol y permiso. |
| RF-046 | Seguridad | El sistema protegera rutas privadas. |
| RF-047 | Seguridad | El sistema almacenara contrasenas con bcrypt. |
| RF-048 | Auditoria | El sistema registrara operaciones relevantes para auditoria. |

## Requerimientos no funcionales

| ID | Categoria | Requerimiento |
| --- | --- | --- |
| RNF-001 | Seguridad | Las contrasenas nunca se almacenaran en texto plano. |
| RNF-002 | Seguridad | Los tokens tendran expiracion y renovacion controlada. |
| RNF-003 | Seguridad | Las rutas administrativas requeriran permisos explicitos. |
| RNF-004 | Seguridad | La API aplicara Helmet, CORS restringido y validacion de entrada. |
| RNF-005 | Rendimiento | Las consultas listadas deberan soportar paginacion. |
| RNF-006 | Rendimiento | Los endpoints principales deberan responder en menos de 800 ms bajo carga normal. |
| RNF-007 | Escalabilidad | La arquitectura separara frontend, backend y base de datos. |
| RNF-008 | Mantenibilidad | El backend seguira separacion entre controllers, services y repositories. |
| RNF-009 | Mantenibilidad | El frontend separara pages, components, hooks, services y schemas. |
| RNF-010 | Calidad | El codigo futuro usara TypeScript estricto. |
| RNF-011 | Calidad | Las validaciones se definiran cerca de los DTOs o schemas. |
| RNF-012 | Disponibilidad | La aplicacion usara proveedores cloud con monitoreo basico. |
| RNF-013 | Observabilidad | El backend registrara solicitudes y errores con Morgan/logging estructurado. |
| RNF-014 | Usabilidad | La interfaz sera responsive para desktop, tablet y movil. |
| RNF-015 | Usabilidad | Las acciones criticas mostraran confirmacion o feedback claro. |
| RNF-016 | Accesibilidad | Los formularios tendran labels, errores y navegacion por teclado. |
| RNF-017 | Compatibilidad | La API entregara respuestas JSON consistentes. |
| RNF-018 | Integridad | La base de datos aplicara claves foraneas y restricciones de unicidad. |
| RNF-019 | Integridad | El stock no podra quedar negativo. |
| RNF-020 | Integridad | Los cupos de reserva se controlaran transaccionalmente. |
| RNF-021 | Portabilidad | El despliegue se documentara para Vercel, Render y Neon. |
| RNF-022 | Configuracion | Las credenciales se gestionaran mediante variables de entorno. |
| RNF-023 | Privacidad | Los datos personales se limitaran a los necesarios para la operacion. |
| RNF-024 | Auditoria | Las operaciones sensibles registraran actor, fecha, entidad y accion. |
| RNF-025 | Documentacion | La API mantendra contrato OpenAPI actualizado. |

## Restricciones del sistema

- El backend sera una API REST con Express.js y TypeScript.
- La base de datos sera PostgreSQL y el ORM sera Prisma.
- Los pagos seran simulados y no procesaran dinero real.
- Las imagenes se almacenaran en Cloudinary.
- El frontend se desplegara en Vercel y el backend en Render.
- La autenticacion usara JWT con access token y refresh token.

## Supuestos

- Cada usuario tendra un rol principal.
- Las membresias activas se calculan por fecha de inicio, fecha de fin y estado.
- Los beneficios se definen por plan de membresia.
- Una reserva puede ser de sala, entrenador o nutricionista.
- La tienda maneja productos fisicos con stock.
- El dashboard consume datos agregados desde endpoints protegidos.

