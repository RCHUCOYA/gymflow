# 13. Autenticacion y Seguridad

## JWT

- Access token de corta duracion para autorizar llamadas API.
- Refresh token de mayor duracion, almacenado y revocable.
- Payload minimo: `sub`, `role`, `permissions`, `iat`, `exp`.
- No incluir informacion sensible en tokens.

## Roles y permisos

| Rol | Permisos principales |
| --- | --- |
| Administrador | Gestion total, dashboard, usuarios, catalogos, reportes y auditoria. |
| Recepcionista | Validar membresias, registrar asistencia, gestionar reservas operativas y pagos presenciales simulados. |
| Cliente | Comprar membresia, reservar, comprar productos, consultar historial y perfil. |
| Entrenador | Ver agenda, gestionar sesiones y registrar progreso. |
| Nutricionista | Ver agenda, gestionar consultas y registrar planes nutricionales. |

## Middlewares

- `authenticate`: valida access token.
- `authorizeRole`: verifica rol permitido.
- `authorizePermission`: verifica permiso especifico.
- `validateRequest`: aplica validadores de entrada.
- `errorHandler`: normaliza errores.
- `auditLogger`: registra acciones sensibles.
- `rateLimiter`: limita abuso en auth y endpoints criticos.

## Hardening

- `Helmet` para cabeceras de seguridad.
- `CORS` restringido al dominio del frontend.
- `bcrypt` con costo adecuado para contrasenas.
- Validacion y sanitizacion de entradas.
- Variables de entorno fuera del repositorio.
- Cookies `httpOnly`, `secure` y `sameSite` si se decide almacenar refresh token en cookie.
- Logs sin contrasenas, tokens ni datos sensibles.

## Recuperacion de contrasena

El flujo futuro generara un token temporal de un solo uso, con expiracion corta. Al confirmar nueva contrasena, el token se invalida y se revocan refresh tokens activos del usuario.

