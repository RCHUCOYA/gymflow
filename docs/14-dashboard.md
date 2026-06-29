# 14. Dashboard

## Objetivo

Entregar al administrador una vista ejecutiva del estado comercial y operativo del gimnasio.

## KPIs

- Ingresos totales por periodo.
- Ingresos por membresias.
- Ingresos por tienda.
- Membresias activas.
- Membresias vencidas.
- Membresias proximas a vencer.
- Reservas realizadas.
- Reservas canceladas.
- Tasa de ocupacion por sala.
- Productos mas vendidos.
- Ticket promedio.
- Clientes nuevos.
- Asistencias registradas.

## Graficos

| Grafico | Tipo | Fuente |
| --- | --- | --- |
| Ventas por dia | Linea | orders, payments, memberships |
| Ingresos por categoria | Dona | products, order_items |
| Reservas por sala | Barras | rooms, reservations |
| Estado de membresias | Dona | user_memberships |
| Productos mas vendidos | Barras horizontales | order_items |
| Citas por profesional | Barras | appointments |

## Filtros

- Rango de fechas.
- Tipo de ingreso: membresia, tienda o ambos.
- Sala.
- Profesional.
- Categoria de producto.
- Estado de reserva o membresia.

## Reglas de visualizacion

- Los indicadores deben mostrar estado vacio cuando no existan datos.
- Los montos deben mostrarse con moneda local configurable.
- Las metricas deben respetar permisos; solo Administrador accede al dashboard completo.

