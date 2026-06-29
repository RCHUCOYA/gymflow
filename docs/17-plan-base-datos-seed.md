# 17. Plan de Base de Datos y Seed

## Objetivo

Definir datos iniciales realistas para desarrollo, demos y pruebas manuales. Este documento no contiene SQL ni Prisma seed ejecutable; describe el contenido esperado para implementarlo despues.

## Roles

- Administrador.
- Recepcionista.
- Cliente.
- Entrenador.
- Nutricionista.

## Usuarios demo

| Rol | Correo | Uso |
| --- | --- | --- |
| Administrador | admin@gymflow.dev | Gestion completa. |
| Recepcionista | recepcion@gymflow.dev | Validacion y asistencia. |
| Cliente | cliente@gymflow.dev | Compra y reservas. |
| Entrenador | trainer@gymflow.dev | Agenda y progreso. |
| Nutricionista | nutri@gymflow.dev | Agenda y planes. |

## Membresias

| Plan | Duracion | Beneficios |
| --- | --- | --- |
| Dia | 1 dia | Acceso basico. |
| Semanal | 7 dias | Salas generales. |
| Mensual | 30 dias | Salas generales y reservas. |
| Trimestral | 90 dias | Reservas y promociones. |
| Anual | 365 dias | Beneficios extendidos. |
| Premium | 30 dias | Entrenador y nutricionista. |
| VIP | 30 dias | Prioridad, descuentos y beneficios completos. |

## Salas

- Sala de pesas.
- Sala de boxeo.
- Sala de baile.
- Sala de pilates.
- Sala funcional.
- Sala de crossfit.
- Sala de yoga.

## Horarios

- Manana: 06:00, 07:00, 08:00, 09:00.
- Tarde: 16:00, 17:00, 18:00.
- Noche: 19:00, 20:00, 21:00.

Cada horario debe tener cupo segun capacidad de la sala.

## Profesionales

| Tipo | Especialidades sugeridas |
| --- | --- |
| Entrenador | Fuerza, crossfit, funcional, perdida de peso, hipertrofia. |
| Nutricionista | Nutricion deportiva, recomposicion corporal, habitos saludables. |

## Productos

| Categoria | Productos |
| --- | --- |
| Proteinas | Whey protein, isolate protein. |
| Creatina | Creatina monohidratada. |
| Pre Workout | Pre entreno energia. |
| BCAA | Aminoacidos. |
| Bebidas | Agua, bebida isotonic, bebida proteinica. |
| Accesorios | Shaker, guantes, toalla, straps, banda elastica. |

## Promociones

- 10% de descuento en membresia trimestral.
- 15% de descuento en productos seleccionados para clientes VIP.
- Combo shaker + proteina.

## Criterios para seed futuro

- Usar IDs generados.
- Crear contrasenas demo con hash bcrypt.
- Mantener usuarios demo activos.
- Crear stock suficiente para pruebas.
- Crear reservas y ordenes historicas para alimentar dashboard.

