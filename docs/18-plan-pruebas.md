# 18. Plan de Pruebas

## Estrategia

La calidad se validara por capas: reglas de negocio en services, integracion API con base de datos, pruebas de contrato con OpenAPI/Bruno y pruebas de interfaz para flujos criticos.

## Pruebas funcionales

| ID | Escenario | Resultado esperado |
| --- | --- | --- |
| PF-001 | Registro con correo nuevo. | Usuario creado con rol Cliente. |
| PF-002 | Registro con correo existente. | Error 409. |
| PF-003 | Login valido. | Tokens y perfil. |
| PF-004 | Login invalido. | Error 401. |
| PF-005 | Comprar membresia. | Membresia activa y pago registrado. |
| PF-006 | Reservar sala con cupo. | Reserva confirmada. |
| PF-007 | Reservar sala sin membresia. | Error 422. |
| PF-008 | Reservar sala sin cupo. | Error 409. |
| PF-009 | Comprar producto con stock. | Orden confirmada y stock reducido. |
| PF-010 | Comprar producto sin stock. | Error 409. |

## Pruebas de integracion

- Auth con usuarios reales en base de datos de prueba.
- Membresias con pagos simulados.
- Reservas con validacion de cupos transaccionales.
- Ordenes con descuento de inventario.
- Dashboard con datos agregados.

## Pruebas de autenticacion y autorizacion

- Token ausente devuelve 401.
- Token expirado devuelve 401.
- Rol sin permiso devuelve 403.
- Refresh token revocado no renueva sesion.
- Cliente no accede a endpoints admin.

## Pruebas API con Bruno

- Variables de entorno: `baseUrl`, `accessToken`, `refreshToken`.
- Carpetas por modulo.
- Requests para login, registro, perfil, membresias, reservas, productos, checkout y dashboard.
- Validar codigos HTTP y estructura JSON.

## Pruebas de interfaz

- Login y registro.
- Compra de membresia.
- Reserva de sala.
- Compra en tienda.
- Dashboard administrativo.
- Accesibilidad basica de formularios.
- Responsive desktop y movil.

## Criterios de aceptacion de QA

- No hay endpoints privados sin autenticacion.
- Las reglas de negocio criticas devuelven errores claros.
- Los diagramas Mermaid renderizan.
- OpenAPI es valido.
- La coleccion Bruno permite recorrer el flujo principal.

