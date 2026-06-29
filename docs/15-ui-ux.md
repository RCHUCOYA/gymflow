# 15. Diseno UI/UX

## Principios

- Interfaz clara, operativa y responsive.
- Navegacion por rol para evitar opciones innecesarias.
- Formularios con validacion inmediata y mensajes claros.
- Tablas con busqueda, filtros, paginacion y estados.
- Dashboard denso pero legible, orientado a decision.

## Pantallas

| Pantalla | Objetivo | Componentes | Acciones |
| --- | --- | --- | --- |
| Landing | Presentar GymFlow y beneficios. | Hero, modulos, stack, CTA. | Ir a login o registro. |
| Login | Autenticar usuarios. | Formulario, enlace recuperar. | Iniciar sesion. |
| Registro | Crear cuenta cliente. | Formulario validado. | Registrar usuario. |
| Dashboard | Mostrar resumen segun rol. | KPIs, graficos, agenda o accesos. | Filtrar, navegar a detalle. |
| Perfil | Gestionar datos personales. | Formulario, avatar, seguridad. | Actualizar datos y contrasena. |
| Membresias | Explorar y comprar planes. | Cards de planes, beneficios. | Comprar o renovar. |
| Reservas | Reservar salas. | Calendario/lista, filtros, estados. | Crear o cancelar reserva. |
| Entrenadores | Ver profesionales. | Cards, especialidad, disponibilidad. | Reservar sesion. |
| Nutricionistas | Ver profesionales. | Cards, disponibilidad. | Reservar consulta. |
| Productos | Comprar en tienda. | Grid, filtros, buscador. | Agregar al carrito. |
| Carrito | Revisar compra. | Items, cantidades, totales. | Actualizar, eliminar, checkout. |
| Checkout | Confirmar pago simulado. | Resumen, metodo de pago. | Confirmar compra. |
| Admin usuarios | Administrar cuentas. | Tabla, filtros, dialog. | Crear, editar, cambiar rol, inactivar. |
| Admin productos | Gestionar tienda. | Tabla, formulario, imagen. | CRUD y stock. |
| Admin salas | Gestionar salas y horarios. | Tabla, calendario. | CRUD y cupos. |
| Admin reportes | Analizar negocio. | Graficos y filtros. | Exportacion futura. |
| Agenda profesional | Ver citas asignadas. | Calendario/lista. | Confirmar, observar, registrar progreso o plan. |
| Configuracion | Ajustes operativos. | Formularios y toggles. | Actualizar parametros. |

## Estados de interfaz

- Loading con skeletons.
- Empty state con accion sugerida.
- Error state con reintento.
- Confirmacion para acciones destructivas.
- Toasts para resultados breves.

